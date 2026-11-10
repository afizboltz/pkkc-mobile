// Member-supplied text (name, email) is interpolated directly into the PDF
// export's HTML in userList.tsx/renewUserList.tsx — escape it first so a
// name containing `<`/`&`/etc. can't break the markup.
export const escapeHtml = (value: string | null | undefined): string =>
    (value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
