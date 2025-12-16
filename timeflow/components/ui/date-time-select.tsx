import { Layout } from '@/constants/layout';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BlurView } from "expo-blur";
import { Button, Popover, PopoverTriggerRef, TextField, useThemeColor } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Keyboard, Pressable, StyleSheet } from "react-native";

const WIDTH = Dimensions.get('window').width * .9;

const DateTimeSelect = ({ value, label, onDateChange }: { value: Date, label: string, onDateChange: (date: Date) => void }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);

    const popoverRef = useRef<PopoverTriggerRef>(null);
    const background = useThemeColor('background');
    
    useEffect(() => {
        if (value instanceof Date) {
            setSelectedDate(value);
        } else {
            setSelectedDate(new Date());
        }
    }, [value]);

    useEffect(() => {
        if (isOpen)
            Keyboard.dismiss();
    }, [isOpen]);

    const handleDateChange = (event: DateTimePickerEvent, date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
        }
    }

    const handleClose = () => {
        if (selectedDate) {
            const utcDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                selectedDate.getHours(), 
                selectedDate.getMinutes(),
                0, 0
            );

            onDateChange(utcDate);
        }

        popoverRef.current?.close();
    }
    
    return (
        <Popover onOpenChange={setIsOpen}>
            <Popover.Trigger ref={popoverRef} asChild>
                <Pressable>
                    <DateTimeInput value={selectedDate!} label={label} />
                </Pressable>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Overlay />
                <BlurView
                    intensity={25}
                    tint="dark"
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        overflow: 'hidden',
                    }}
                >
                    <Popover.Content 
                        backgroundStyle={{ 
                            backgroundColor: background, 
                            borderTopLeftRadius: Layout.borderRadius,
                            borderTopRightRadius: Layout.borderRadius, 
                        }}
                        presentation='bottom-sheet'
                        snapPoints={['60%']}
                    >
                        <DateTimePicker
                            value={selectedDate || new Date()}
                            mode="datetime"
                            display='spinner'
                            onChange={handleDateChange}
                            maximumDate={new Date}
                        />
                        <Popover.Description className="self-center">
                            <Button style={{ width: WIDTH }} variant="primary" size="lg" onPress={handleClose}>
                                <Button.Label style={{ color: 'black', fontSize: 18, fontWeight: '700' }}>Done</Button.Label>
                            </Button>
                        </Popover.Description>
                    </Popover.Content>
                </BlurView>
            </Popover.Portal>
        </Popover>
    );
}

const DateTimeInput = ({ value, label }: { value: Date, label: string }) => {
    const foreground = useThemeColor('foreground');

    const parseValue = (date: Date) => {
        return date ? date.toLocaleString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit'
        }) : '';
    }

    return <TextField style={{ width: WIDTH }} >
        <TextField.Label style={{ color: foreground, fontSize: 20 }}>{label}</TextField.Label>
        <TextField.Input 
            placeholder="USD ($)"
            editable={false}
            pointerEvents="none"
            className="rounded-full"
            value={parseValue(value)}
            style={{
                fontWeight: '900',
                fontSize: 20,
                textAlignVertical: 'center',
                color: 'white',
            }}
            animation={{
                backgroundColor: {
                    value: {
                        blur: '#0f172abf',
                        focus: '#0f172abf',
                        error: '#0f172abf',
                    },
                    
                },
                borderColor: {
                    value: {
                        blur: '#334155',
                        focus: '#334155',
                        error: '#dc2626',
                    },
                },
            }}
        />
    </TextField>
}

export default DateTimeSelect;