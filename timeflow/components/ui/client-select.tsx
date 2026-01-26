import { Layout } from '@/constants/layout';
import { useClients } from '@/hooks/use-clients';
import { BlurView } from 'expo-blur';
import { Button, Select, TextField, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, Keyboard, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import { Icon } from './icon';

const INPUT_WIDTH = Dimensions.get('window').width * 0.85;

type ClientSelectProps = {
    selectedClientId: string | undefined;
    onClientSelect: (clientId: string | undefined) => void;
    isDisabled?: boolean;
}

const ClientSelect = ({ selectedClientId, onClientSelect, isDisabled = false }: ClientSelectProps) => {
    const { clients } = useClients();
    
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [searchFilter, setSearchFilter] = useState<string | undefined>(undefined);
    
    // Фільтрація клієнтів для пошуку
    const filteredClients = searchFilter 
        ? clients.filter(c => c.name.toLowerCase().includes(searchFilter.toLowerCase()))
        : clients;

    // Знаходимо об'єкт вибраного клієнта для відображення
    const selectedClient = clients.find(c => c.id === selectedClientId);

    useEffect(() => {
        if (isOpen) Keyboard.dismiss();
    }, [isOpen]);

    const handleClearFilter = useCallback(() => {
        setSearchFilter(undefined);
    }, []);

    const handleSelect = useCallback((value: string) => {
        // Якщо вибрали того ж самого - можна зняти вибір (опціонально)
        // Або просто встановити нове значення
        onClientSelect(value);
        setIsOpen(false);
        handleClearFilter();
    }, [onClientSelect, handleClearFilter]);

    const handleOnClear = useCallback(() => {
        onClientSelect(undefined);
        setIsOpen(false);
        handleClearFilter();
    }, [onClientSelect, handleClearFilter]);

    // Якщо клієнтів немає, нічого не показуємо (але краще це контролювати ззовні)
    if (clients.length === 0) return null;

    return (
        <Select
            isOpen={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                handleClearFilter();
            }}
            value={selectedClient ? { value: selectedClient.id, label: selectedClient.name } : undefined}
            onValueChange={(option) => {
                if (option?.value) {
                    handleSelect(option.value);
                }
            }}
        >
            <Select.Trigger>
                <ClientInput 
                    isDisabled={isDisabled} 
                    clientName={selectedClient?.name} 
                    clientColor={selectedClient?.color}
                    onClear={handleOnClear}
                    hasSelection={!!selectedClient}
                />
            </Select.Trigger>
            
            <Select.Portal>
                <Select.Overlay />
                {isOpen && (
                    <BlurView
                        intensity={25}
                        tint='systemThinMaterialDark'
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            overflow: 'hidden',
                        }}
                    >
                        <Select.Content 
                            backgroundStyle={{ 
                                backgroundColor: background, 
                                borderTopLeftRadius: Layout.borderRadius,
                                borderTopRightRadius: Layout.borderRadius, 
                            }}
                            presentation='bottom-sheet'
                            snapPoints={['60%']}
                        >
                            <View style={{ height: Math.min(clients.length * 80 + 100, 500) }}>
                                {clients.length > 5 && (
                                    <View style={{ alignSelf: 'center', marginBottom: Layout.spacing, marginTop: Layout.spacing, gap: Layout.spacing }}>
                                        <TextField style={{ width: INPUT_WIDTH }}>
                                            <TextField.Input
                                                placeholder="Search client..."
                                                placeholderTextColor={foreground}
                                                className="rounded-full"
                                                value={searchFilter}
                                                onChangeText={setSearchFilter}
                                                style={{
                                                    fontSize: 18,
                                                    color: foreground,
                                                }}
                                                animation={{
                                                    backgroundColor: { value: { blur: accent + '20', focus: accent + '20', error: accent + '20' } },
                                                    borderColor: { value: { blur: accent + '20', focus: accent + '20', error: danger } },
                                                }}
                                            >
                                                <TextField.InputStartContent>
                                                    <Icon name='search-outline' color={foreground}/>
                                                </TextField.InputStartContent>
                                                <TextField.InputEndContent>
                                                    <Pressable onPress={handleClearFilter}>
                                                        <Icon name='close-outline' color={foreground}/>
                                                    </Pressable>
                                                </TextField.InputEndContent>
                                            </TextField.Input>
                                        </TextField>
                                    </View>
                                )}

                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                                    {filteredClients.map((client) => (
                                        <Select.Item
                                            key={client.id}
                                            value={client.id}
                                            label={client.name}
                                        >
                                            <View style={{ 
                                                flexDirection: 'row', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                width: INPUT_WIDTH,
                                                alignSelf: 'center',
                                                paddingVertical: 10,
                                                borderRadius: Layout.borderRadius,
                                                backgroundColor: client.id === selectedClientId ? accent + '40' : 'transparent',
                                                paddingHorizontal: client.id === selectedClientId ? Layout.spacing : 0
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                    <View style={{ 
                                                        width: 40, height: 40, borderRadius: 20, 
                                                        backgroundColor: client.color || accent + '40',
                                                        justifyContent: 'center', alignItems: 'center'
                                                    }}>
                                                        <AppText style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>
                                                            {client.name.charAt(0).toUpperCase()}
                                                        </AppText>
                                                    </View>
                                                    <View style={{ gap: Layout.spacing }}>
                                                        <AppText style={{ color: foreground, fontSize: 18, fontWeight: '600' }}>
                                                            {client.name}
                                                        </AppText>
                                                        <View>
                                                            <AppText style={{ color: muted }}>{client.defaultRate} / hour</AppText>
                                                        </View>
                                                    </View>
                                                </View>                                             
                                                <Select.ItemIndicator />
                                            </View>
                                        </Select.Item>
                                    ))}
                                </ScrollView>
                            </View>
                        </Select.Content> 
                    </BlurView>
                )}
            </Select.Portal>
        </Select>
    );
}

const ClientInput = ({ clientName, clientColor, isDisabled, onClear, hasSelection }: { clientName?: string, clientColor?: string, isDisabled?: boolean, onClear: () => void, hasSelection: boolean}) => {
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');

    return (
        <TextField isDisabled={isDisabled}>
            <TextField.Label style={{ color: foreground, fontSize: 20 }}>Client (Optional)</TextField.Label>
            <TextField.Input 
                placeholder="Select Client"
                editable={false}
                pointerEvents="none"
                className="rounded-full"
                value={clientName || "No Client Selected"}
                style={{
                    fontWeight: '900',
                    fontSize: 20,
                    textAlignVertical: 'center',
                    color: clientName ? (clientColor || accent) : foreground,
                }}
                animation={{
                    backgroundColor: { value: { blur: accent + '20', focus: accent + '20', error: accent + '20' } },
                    borderColor: { value: { blur: accent + '20', focus: accent + '20', error: danger } },
                }}
            >
                {hasSelection && (
                    <TextField.InputEndContent>
                        <Button size='sm' variant='ghost' isIconOnly onPress={onClear}>
                            <Icon name="close-outline" />
                        </Button>
                    </TextField.InputEndContent>
                )}
            </TextField.Input>
        </TextField>
    );
}

export default ClientSelect;