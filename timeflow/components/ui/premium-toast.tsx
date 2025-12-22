import { Layout } from "@/constants/layout";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Popover, PopoverTriggerRef, Toast, useThemeColor, useToast } from "heroui-native";
import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import PremiumCard from "../settings/premium-card";

export const usePremiumToast = () => {
    const { toast } = useToast();

    const popoverRef = useRef<PopoverTriggerRef>(null);
    const timeoutRef = useRef<number | null>(null);
    const background = useThemeColor('background');

    const handleClose = () => {
        popoverRef.current?.close();
        toast.hide('all');
    }

    const showToast = (label: string, description: string, displayAction: boolean = true, autoDismissDuration: number = 5000) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        toast.show({
            duration: 0,
            component: (props) => (
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 3 }}>
                            <Toast.Label style={{ fontSize: 22 }}>{label}</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>{description}</Toast.Description>
                        </View>
                        {displayAction &&
                            <Popover>
                                <Popover.Trigger ref={popoverRef} asChild>
                                    <Pressable>
                                        <LinearGradient
                                            colors={["#f7f455ff", "#22cea9ff"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{ borderRadius: 9999, flex: 1.05 }}
                                        >
                                            <Toast.Action 
                                                style={{ backgroundColor: 'transparent' }} 
                                                onPress={() => {
                                                    if (timeoutRef.current) {
                                                        clearTimeout(timeoutRef.current);
                                                        timeoutRef.current = null;
                                                    }
                                                    popoverRef.current?.open();
                                                }}
                                            >
                                                <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '600', color: "black" }}>Upgrade</Text>
                                            </Toast.Action>
                                        </LinearGradient>
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
                                            snapPoints={['75%']}
                                        >
                                            <PremiumCard handleSuccess={handleClose} />
                                            <Button  
                                                onPress={handleClose}
                                                style={{
                                                    borderRadius: 9999,
                                                    borderWidth: 1,
                                                    borderColor: '#2bee6c',
                                                    backgroundColor: 'transparent',
                                                    width: '100%',
                                                    paddingHorizontal: Layout.spacing * 3,
                                                    paddingVertical: Layout.spacing / 1.5,
                                                    marginTop: Layout.spacing * 6
                                                }}
                                            >
                                                <Button.Label 
                                                    style={{ 
                                                        fontSize: 24, 
                                                        fontWeight: '600', 
                                                        color: "#2bee6c" 
                                                    }}
                                                >
                                                    Close
                                                </Button.Label>
                                            </Button>
                                        </Popover.Content>
                                    </BlurView>
                                </Popover.Portal>
                            </Popover>
                        }
                    </View>
                </Toast>
            ),
        });

        timeoutRef.current = setTimeout(() => {
            toast.hide('all');
            timeoutRef.current = null;
        }, autoDismissDuration);
    }
    
    return {
        showToast,
    }
}