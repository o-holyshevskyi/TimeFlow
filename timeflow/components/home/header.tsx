import { Layout } from "@/constants/layout";
import { BlurView } from "expo-blur";
import * as Haptic from "expo-haptics";
import { useRouter } from "expo-router";
import { Button, Popover, PopoverTriggerRef, useThemeColor } from "heroui-native";
import { useRef } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, ZoomIn, ZoomOut } from "react-native-reanimated";
import { AppText } from "../ui/app-text";
import { Icon } from '../ui/icon';

const POPOVER_HEIGHT = Dimensions.get('window').height * 0.80;

const AnimatedMenuItem = ({ index, children }: { index: number, children: React.ReactNode }) => (
    <Animated.View
        entering={FadeInDown.delay(index * 100).duration(200).springify(250).damping(80)}
        style={{ width: '100%', alignItems: 'flex-end' }}
    >
        {children}
    </Animated.View>
);

const Header = () => {
    const foreground = useThemeColor('foreground');
    const router = useRouter();
    const popoverRef = useRef<PopoverTriggerRef>(null);

    // Consolidated handler logic for cleaner JSX
    const handleNavigation = (path: string) => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
        popoverRef.current?.close();
        router.push(path as any); // Uncomment when routes exist
    };

    const handleMenuOpen = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
        popoverRef.current?.open();
    };

    const handleMenuClose = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
        popoverRef.current?.close();
    };

    return (
        <View style={[styles.container]}>
            <View style={{ width: Layout.spacing * 10 }} />
            <AppText style={[{ color: foreground }, styles.headerText]}>
                Time Tracker
            </AppText>
            
            <Popover>
                <Popover.Trigger ref={popoverRef} asChild>
                    <Pressable style={{ paddingHorizontal: Layout.spacing * 2 }} onPress={handleMenuOpen}>
                        <Icon name='menu-outline' />
                    </Pressable>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Overlay />
                    <BlurView
                        intensity={40}
                        tint="dark"
                        style={styles.blurContainer}
                    >
                        <Popover.Content
                            className="bg-transparent flex-column justify-between gap-10"
                            width='full'
                        >
                            <View style={{ height: POPOVER_HEIGHT }}>
                                {/* Menu Items Container */}
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: 'flex-end',
                                        justifyContent: 'flex-start',
                                        paddingHorizontal: Layout.spacing * 1,
                                        paddingTop: Layout.spacing * 4, // Added some top padding
                                    }}
                                >
                                    <AnimatedMenuItem index={0}>
                                        <Button variant="ghost" onPress={() => handleNavigation('/cards/sessions-list')}>
                                            <Icon name="calendar-outline" />
                                            <Button.Label style={{ color: foreground, fontSize: 18, fontWeight: '700' }}>
                                                Sessions
                                            </Button.Label>
                                        </Button>
                                    </AnimatedMenuItem>

                                    <AnimatedMenuItem index={1}>
                                        <Button variant="ghost" onPress={() => handleNavigation('/cards/clients')}>
                                            <Icon name="briefcase-outline" />
                                            <Button.Label style={{ color: foreground, fontSize: 18, fontWeight: '700' }}>
                                                My Clients
                                            </Button.Label>
                                        </Button>
                                    </AnimatedMenuItem>

                                    <AnimatedMenuItem index={2}>
                                        <Button variant="ghost" onPress={() => handleNavigation('/cards/analytics')}>
                                            <Icon name='stats-chart-outline' />
                                            <Button.Label style={{ color: foreground, fontSize: 18, fontWeight: '700' }}>
                                                Analytics
                                            </Button.Label>
                                        </Button>
                                    </AnimatedMenuItem>

                                    <AnimatedMenuItem index={3}>
                                        <Button variant="ghost" onPress={() => handleNavigation('/cards/settings')}>
                                            <Icon name='settings-outline' />
                                            <Button.Label style={{ color: foreground, fontSize: 18, fontWeight: '700' }}>
                                                Settings
                                            </Button.Label>
                                        </Button>
                                    </AnimatedMenuItem>
                                </View>

                                {/* Close Button Container */}
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: 'flex-end',
                                        justifyContent: 'flex-end',
                                        paddingHorizontal: Layout.spacing * 1,
                                        paddingBottom: Layout.spacing * 2,
                                    }}
                                >
                                    {/* Different animation for Close button (Pop in) */}
                                    <Animated.View 
                                        entering={ZoomIn.delay(400).springify()}
                                        exiting={ZoomOut.duration(200)}
                                    >
                                        <Button onPress={handleMenuClose} isIconOnly variant="primary" style={{ borderRadius: 9999 }}>
                                            <Icon name='close-outline' color="black" />
                                        </Button>
                                    </Animated.View>
                                </View>
                            </View>
                        </Popover.Content>
                    </BlurView>
                </Popover.Portal>
            </Popover>
        </View>
    );
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
        fontWeight: '700'
    },
    blurContainer: {
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    }
});

export default Header;