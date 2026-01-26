import DateTimePicker from '@react-native-community/datetimepicker';
import { TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Dimensions, Modal, Platform, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { useUniwind } from 'uniwind';
import { THEMES } from '../settings/themes-card';
import { AppText } from "../ui/app-text";

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
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');
    const background = useThemeColor('background');

    const { theme } = useUniwind();
    
    const activeTheme = THEMES.find(t => t.id === theme);

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
                                color: foreground,
                            }}
                            animation={{
                                backgroundColor: { value: { blur: accent + '20', focus: accent + '20', error: accent + '20' } },
                                borderColor: { value: { blur: accent + '20', focus: accent + '20', error: danger } },
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
                        <View style={[styles.modalContent, { backgroundColor: background }]} onStartShouldSetResponder={() => true}>
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="inline" // ВАЖЛИВО: 'inline' показує календар відразу
                                onChange={handleDateChange}
                                style={{ height: 320, width: 320, backgroundColor: 'transparent' }}
                                textColor={foreground}
                                accentColor={accent}
                                themeVariant={activeTheme?.id === "nord" ? "light" : "dark"} // або "light", залежно від вашої теми
                            />
                            
                            <TouchableOpacity 
                                style={[styles.closeButton, { backgroundColor: accent }]} 
                                onPress={() => setShowPicker(false)}
                            >
                                <AppText style={[styles.closeButtonText, { color: foreground }]}>Done</AppText>
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
        borderRadius: 10,
    },
    closeButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});