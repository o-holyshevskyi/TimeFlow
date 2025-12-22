import { Layout } from "@/constants/layout";
import { BlurView } from "expo-blur";
import * as Haptic from "expo-haptics";
import { useRouter } from "expo-router";
import { Button, Popover, PopoverTriggerRef, useThemeColor } from "heroui-native";
import { useRef } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from '../ui/icon';

const POPOVER_HEIGHT = Dimensions.get('window').height * 0.80;

const Header = () => {
    const foreground = useThemeColor('foreground');

    const router = useRouter();
    const popoverRef = useRef<PopoverTriggerRef>(null);

    const handleOnListPress = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
        popoverRef.current?.close();
        router.push('/cards/sessions-list');
    }

    const handleOnSettingsPress = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
        popoverRef.current?.close();
        router.push('/cards/settings');
    }

    const handleOnAnalyticsPress = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
        popoverRef.current?.close();
        router.push('/cards/analytics');
    }

    const handleMenuOpen = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
        popoverRef.current?.open();
    }

    const handleMenuClose = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
        popoverRef.current?.close();
    }

    return <View style={[styles.container]}>
        <View style={{width: Layout.spacing * 10 }} />
        <Text
            style={[{ color: foreground }, styles.headerText]}
        >
            Time Tracker
        </Text>
        <Popover>
            <Popover.Trigger ref={popoverRef} asChild>
                <Pressable style={{paddingHorizontal: Layout.spacing * 2}} onPress={handleMenuOpen}>
                    <Icon name='menu-outline'/>
                </Pressable>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Overlay />
                <BlurView
                    intensity={40}
                    tint="dark"
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        overflow: 'hidden',
                    }}
                >
                    <Popover.Content
                        className="bg-transparent flex-column justify-between gap-10"
                        width='full'
                    >
                        <View
                            style={{ height: POPOVER_HEIGHT}}
                        >
                            <View 
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'flex-end', 
                                    justifyContent: 'flex-start', 
                                    paddingHorizontal: Layout.spacing * 1,
                                }}
                            >
                                <Button variant="ghost" onPress={handleOnListPress}>
                                    <Icon name="calendar-outline"/>
                                    <Button.Label style={{ color: foreground, fontSize: 18, fontWeight: '700' }}>
                                        Sessions
                                    </Button.Label>
                                </Button>
                                <Button variant="ghost" onPress={handleOnAnalyticsPress}>
                                    <Icon name='stats-chart-outline'/>
                                    <Button.Label style={{ color: foreground, fontSize: 18, fontWeight: '700' }}>
                                        Analytics
                                    </Button.Label>
                                </Button>    
                                <Button variant="ghost" onPress={handleOnSettingsPress}>
                                    <Icon name='settings-outline'/>
                                    <Button.Label style={{ color: foreground, fontSize: 18, fontWeight: '700' }}>
                                        Settings
                                    </Button.Label>
                                </Button>                        
                            </View>      
                            <View
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'flex-end', 
                                    justifyContent: 'flex-end', 
                                    paddingHorizontal: Layout.spacing * 1,
                                }}
                            >
                                <Button onPress={handleMenuClose} isIconOnly variant="primary">
                                    <Icon name='close-outline' color="black"/>
                                </Button>
                            </View>
                        </View>
                    </Popover.Content>
                </BlurView>
            </Popover.Portal>
        </Popover>
    </View>;
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Layout.spacing * 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerText: {
        fontSize: 28,
        fontWeight: 700
    }
});

export default Header;
