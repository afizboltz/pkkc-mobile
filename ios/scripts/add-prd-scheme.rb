#!/usr/bin/env ruby
# frozen_string_literal: true
#
# Adds "Debug-Prd"/"Release-Prd" build configurations (project + app target) to
# PKKCSTG.xcodeproj, with a distinct bundle identifier / display name / EXPO_PUBLIC_ENV
# from the staging ones, and fixes the existing Debug/Release configs if a prior
# `expo prebuild` sync drifted PRODUCT_BUNDLE_IDENTIFIER onto the wrong value.
#
# Rerunnable: safe to run again any time Expo's prebuild-sync drifts the existing
# Debug/Release configuration's identity back out of sync.
#
# Usage: ruby ios/scripts/add-prd-scheme.rb

require 'xcodeproj'

ROOT = File.expand_path('..', __dir__)
PROJECT_PATH = File.join(ROOT, 'PKKCSTG.xcodeproj')
TARGET_NAME = 'PKKCSTG'

STG_SETTINGS = {
  'PRODUCT_BUNDLE_IDENTIFIER' => 'my.org.pkkc.stg',
  'EXPO_PUBLIC_ENV' => 'stg',
  'APP_DISPLAY_NAME' => 'PKKC (STG)',
}.freeze

PRD_OVERRIDES = {
  'PRODUCT_BUNDLE_IDENTIFIER' => 'my.org.pkkc',
  'EXPO_PUBLIC_ENV' => 'prd',
  'APP_DISPLAY_NAME' => 'PKKC',
}.freeze

project = Xcodeproj::Project.open(PROJECT_PATH)

target = project.targets.find { |t| t.name == TARGET_NAME }
raise "Target #{TARGET_NAME} not found in #{PROJECT_PATH}" unless target

# --- Step 1: fix drift on the existing Debug/Release target configs ---
target.build_configurations.each do |config|
  next unless %w[Debug Release].include?(config.name)

  STG_SETTINGS.each { |key, value| config.build_settings[key] = value }
  puts "Updated target config '#{config.name}': #{STG_SETTINGS}"
end

# --- Step 2: duplicate Debug/Release -> Debug-Prd/Release-Prd, at both project and target level ---
def duplicate_config(project, owner, source_name, new_name, overrides)
  config_list = owner.build_configuration_list
  if config_list.build_configurations.any? { |c| c.name == new_name }
    puts "Config '#{new_name}' already exists on #{owner.respond_to?(:name) ? owner.name : owner.class} - skipping duplication, re-applying overrides"
    existing = config_list.build_configurations.find { |c| c.name == new_name }
    overrides.each { |key, value| existing.build_settings[key] = value }
    return existing
  end

  source = config_list.build_configurations.find { |c| c.name == source_name }
  raise "Missing source config '#{source_name}' on #{owner}" unless source

  new_config = project.new(Xcodeproj::Project::Object::XCBuildConfiguration)
  new_config.name = new_name
  new_config.build_settings = source.build_settings.dup
  new_config.base_configuration_reference = source.base_configuration_reference if source.respond_to?(:base_configuration_reference)
  overrides.each { |key, value| new_config.build_settings[key] = value }

  config_list.build_configurations << new_config
  puts "Created config '#{new_name}' (cloned from '#{source_name}') on #{owner.respond_to?(:name) ? owner.name : owner.class}"
  new_config
end

# Project-level configs (no identity overrides needed, just need Debug-Prd/Release-Prd to exist)
duplicate_config(project, project, 'Debug', 'Debug-Prd', {})
duplicate_config(project, project, 'Release', 'Release-Prd', {})

# Target-level configs (these carry the actual identity/env overrides)
duplicate_config(project, target, 'Debug', 'Debug-Prd', PRD_OVERRIDES)
duplicate_config(project, target, 'Release', 'Release-Prd', PRD_OVERRIDES)

project.save
puts "Saved #{PROJECT_PATH}"
