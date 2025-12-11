import { Session } from "@/hooks/use-sessions";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from "react-native";

const formatDateForCSV = (timestamp: number): string => {
    return new Date(timestamp).toISOString().replace('T', ' ').split('.')[0];
}

const getDurationInHours = (ms: number): string => {
    return (ms / (1000 * 60 * 60)).toFixed(2);
}

export const exportSessionsToCSV = async (sessions: Session[]) => {
    if (!sessions || sessions.length === 0) {
        Alert.alert('No Data', 'Sessions list is empty, there is no data to export.');
        return;
    }

    try {
        const headers = 'ID,Start Date,End Date,Duration (Hours),Rate,Currency,Total Amount\n';

        const rows = sessions.map(session => {
            const startDate = formatDateForCSV(session.startTime);
            const endDate = formatDateForCSV(session.endTime);
            const durationHours = getDurationInHours(session.elapsedTime);

            const rate = parseFloat(session.rate);
            const totalAmount = (parseFloat(durationHours) * rate).toFixed(2);

            return `${session.id},${startDate},${endDate},${durationHours},${session.rate},${session.currency},${totalAmount}`;
        }).join('\n');

        const csvContent = headers + rows;

        const currentTime = new Date();
        const fileName = `ClariRate_Report_${currentTime.toISOString().split('T')[0]}_${currentTime.getTime()}.csv`;
        const fileUri = FileSystem.cacheDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Oops", "Sharing files is not available on this device");
            return;
        }

        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Session history export',
            UTI: 'public.comma-separated-values-text'
        });
    } catch (error: any) {
        Alert.alert("Export failed", error.message || "Could not create a CSV file.");
    }
}