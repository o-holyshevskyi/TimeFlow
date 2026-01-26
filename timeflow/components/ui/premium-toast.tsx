import { Layout } from "@/constants/layout";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Popover, PopoverTriggerRef, Toast, useThemeColor, useToast } from "heroui-native";
import { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useUniwind } from "uniwind";
import PremiumCard from "../settings/premium-card";
import { THEMES } from "../settings/themes-card";
import { AppText } from "../ui/app-text";

export const usePremiumToast = () => {
    const { toast } = useToast();
    const { theme } = useUniwind();

    const popoverRef = useRef<PopoverTriggerRef>(null);
    const timeoutRef = useRef<number | null>(null);
    const background = useThemeColor('background');
    const accent = useThemeColor('accent');
    const foreground = useThemeColor('foreground');
    const activeTheme = THEMES.find(t => t.id === theme);

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
                <Toast 
                    style={{ backgroundColor: background, borderColor: accent }}
                    variant="default" 
                    placement="top" 
                    className='border-1 p-5' {...props}
                >
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
                                            colors={(activeTheme?.colors || [accent + '50', accent]) as [string, string, ...string[]]}
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
                                                <AppText numberOfLines={1} style={{ fontSize: 16, fontWeight: '600', color: foreground }}>Upgrade</AppText>
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
                                                    borderColor: accent,
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
                                                        color: accent 
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