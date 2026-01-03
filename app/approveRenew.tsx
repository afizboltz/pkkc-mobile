import { getPendingRenewals } from "@/src/services/renewMembership";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Text, View } from "react-native";

export default function ApproveRenewMembershipScreen() {
    const navigation = useNavigation();
    const [renewals, setRenewals] = React.useState<any[]>([]);

    const fetchRenewals = async () => {
        try {
            const data = await getPendingRenewals();
            setRenewals(data);
            console.log("Pending renewals:", data);
        } catch (error) {
            console.error("Error fetching renewals:", error);
        }
    };

    useEffect(() => {
        fetchRenewals()
    }, []);



    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text>Approval Renew Membership</Text>
            {renewals.length > 0 ? (
                <Text>{renewals.length} pending renewals</Text>
            ) : (
                <Text>No pending renewals</Text>
            )}
            <FlatList
                data={renewals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginVertical: 4 }}>
                        <Text>User: {item.userFullName}</Text>
                        <Text>Email: {item.userEmail}</Text>
                        <Text>Amount: RM {item.amount || 'N/A'}.00</Text>
                        <Text>ID: {item.id}</Text>
                        <Text>Submitted: {item.submittedAtMillis ? new Date(item.submittedAtMillis).toLocaleString() : item.submittedAt}</Text>
                    </View>
                )}
            />
        </View>
    );
}
