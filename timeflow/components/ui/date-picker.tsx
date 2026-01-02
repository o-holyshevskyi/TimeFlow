import DateTimePicker from '@react-native-community/datetimepicker';
import { TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Dimensions, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DatePickerProps {
    label: string;
    date: Date;
    onDateChange: (date: Date) => void;
    placeholder?: string;
    width?: number;
}

const WIDTH = Dimensions.get('window').width * .9;

export const DatePicker = ({ 
    label, 
    date, 
    onDateChange, 
    placeholder = "Select date", 
    width 
}: DatePickerProps) => {
    const foreground = useThemeColor('foreground');
    const [showPicker, setShowPicker] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        
        if (selectedDate) {
            onDateChange(selectedDate);
        }
    };

    return (
        <View>
            <Pressable onPress={() => setShowPicker(true)}>
                <View pointerEvents="none">
                    <TextField isDisabled={false} style={{ width: width || WIDTH }}>
                        <TextField.Label style={{ color: foreground, fontSize: 20 }}>
                            {label}
                        </TextField.Label>
                        <TextField.Input 
                            placeholder={placeholder}
                            editable={false}
                            value={date.toLocaleDateString()}
                            className="rounded-full"
                            style={{
                                fontWeight: '900',
                                fontSize: 24,
                                textAlignVertical: 'center',
                                color: 'white',
                            }}
                            animation={{
                                backgroundColor: { value: { blur: '#0f172abf', focus: '#0f172abf', error: '#0f172abf' } },
                                borderColor: { value: { blur: '#334155', focus: '#334155', error: '#dc2626' } },
                            }}
                        />
                    </TextField>
                </View>
            </Pressable>

            {showPicker && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={showPicker}
                    onRequestClose={() => setShowPicker(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalOverlay} 
                        activeOpacity={1} 
                        onPress={() => setShowPicker(false)}
                    >
                        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="inline" // ВАЖЛИВО: 'inline' показує календар відразу
                                onChange={handleDateChange}
                                style={{ height: 320, width: 320 }} // Стилі календаря
                                themeVariant="dark" // або "light", залежно від вашої теми
                            />
                            
                            <TouchableOpacity 
                                style={styles.closeButton} 
                                onPress={() => setShowPicker(false)}
                            >
                                <Text style={styles.closeButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 30,
        backgroundColor: '#2bee6c', // Ваш зелений колір
        borderRadius: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});