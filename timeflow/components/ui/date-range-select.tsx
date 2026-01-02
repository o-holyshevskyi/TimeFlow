import { Dimensions, StyleSheet, View } from "react-native";
import { DatePicker } from './date-picker';

const WIDTH = Dimensions.get('window').width;

export const DateRangeSelect = ({ startDate, endDate, onStartDateChange, onEndDateChange }: {
    startDate: Date;
    endDate: Date;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
}) => {
    return (
        <View style={styles.row}>
            <View>
                <DatePicker
                    label="From"
                    date={startDate}
                    onDateChange={onStartDateChange}
                    width={WIDTH / 2 - 30}
                />
            </View>
            
            <View>
                <DatePicker
                    label="To"
                    date={endDate}
                    onDateChange={onEndDateChange}
                    width={WIDTH / 2 - 30}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
    },
});