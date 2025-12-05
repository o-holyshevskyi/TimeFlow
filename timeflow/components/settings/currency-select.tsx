import { Layout } from '@/constants/layout';
import { BlurView } from 'expo-blur';
import { Select, TextField, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useMemo, useState, } from "react";
import { Dimensions, Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatCurrency, getSupportedCurrencies } from "react-native-format-currency";
import { Icon } from '../ui/icon';

const INPUT_WIDTH = Dimensions.get('window').width * 0.85

type CurrencySelectProps = {
    initialCurrency: undefined | string;
    onCurrencySelect: (currencyCode: string) => void;
}

const CurrencySelect = ({ initialCurrency, onCurrencySelect }: CurrencySelectProps) => {
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const supportedCurrencies = getSupportedCurrencies();

    const sortedCurrencies = useMemo(() => {
        const priorityCurrencies = ['USD', 'EUR'];

        return [
            ...supportedCurrencies.filter(curr => priorityCurrencies.includes(curr.code)),
            ...supportedCurrencies.filter(curr => !priorityCurrencies.includes(curr.code))
        ]
    }, [supportedCurrencies]);

    const [selectedCurrency, setSelectedCurrency] = useState<typeof sortedCurrencies[0]>(sortedCurrencies[0]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currencies, setCurrencies] = useState(sortedCurrencies);
    const [searchFilter, setSearchFilter] = useState<string | undefined>(undefined);

    const getSymbol = (code: string) => {
        const formattedCurrency = formatCurrency({amount: 0, code});
        return formattedCurrency[2];
    }

    useEffect(() => {
        if (searchFilter) {
            if (!searchFilter.trim()) {
                setCurrencies(sortedCurrencies);
                return;
            }

            const search = searchFilter.toLowerCase();
            const filtered = sortedCurrencies.filter(curr =>
                curr.code.toLowerCase().includes(search) ||
                curr.name.toLowerCase().includes(search)
            );

            setCurrencies(filtered);
        }
    }, [searchFilter, sortedCurrencies]);

    useEffect(() => {
        isOpen && Keyboard.dismiss();
        !initialCurrency && onCurrencySelect(selectedCurrency.code);
    }, [isOpen, initialCurrency, onCurrencySelect, selectedCurrency.code]);

    const handleSelectedCurrency = useCallback((option: { value: string, label: string }) => {
        if (option.value) {
            setSelectedCurrency({ code: option.value, name: option.label });
            onCurrencySelect(option.value);
        }
    }, [onCurrencySelect]);

    const handleClearFilter = useCallback(() => {
        setSearchFilter(undefined);
        setCurrencies(sortedCurrencies);
    }, [sortedCurrencies]);

    return <Select
        isOpen={isOpen}
        onOpenChange={(open) => {
            setIsOpen(open);
            handleClearFilter();
        }}
        value={{ value: selectedCurrency.code, label: selectedCurrency.name }}
        onValueChange={(option) => {
            if (option?.value) {
                handleSelectedCurrency(option);
                setSearchFilter(undefined);
            }
        }}
    >
        <Select.Trigger>
            <CurrencyInput code={selectedCurrency.code} symbol={getSymbol(selectedCurrency.code)} />
        </Select.Trigger>
        <Select.Portal>
            <Select.Overlay />
            {isOpen && <BlurView
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
                    
                    <View style={{ height: supportedCurrencies.length * 11 }}>
                        <View style={{ alignSelf: 'center', marginBottom: Layout.spacing, gap: Layout.spacing }}>
                            <TextField style={{ width: INPUT_WIDTH }}>
                                <TextField.Input
                                    placeholder="Search currency (e.g. USD, Euro)"
                                    keyboardType='default'
                                    returnKeyType='search'
                                    placeholderTextColor='#92c9a4'
                                    className="rounded-full"
                                    value={searchFilter}
                                    onChangeText={(val) => setSearchFilter(val)}
                                    style={{
                                        fontSize: 18,
                                        textAlignVertical: 'center',
                                        color: '#92c9a4',
                                    }}
                                    animation={{
                                        backgroundColor: {
                                            value: {
                                                blur: '#23482f',
                                                focus: '#23482f',
                                                error: '#23482f',
                                            },
                                            
                                        },
                                        borderColor: {
                                            value: {
                                                blur: '#23482f',
                                                focus: '#23482f',
                                                error: '#23482f',
                                            },
                                        },
                                    }}
                                >
                                    <TextField.InputStartContent>
                                        <Icon name='search-outline' color='#92c9a4'/>
                                    </TextField.InputStartContent>
                                    <TextField.InputEndContent>
                                        <Pressable onPress={handleClearFilter}>
                                            <Icon name='close-outline' color='#92c9a4'/>
                                        </Pressable>
                                    </TextField.InputEndContent>
                                </TextField.Input>
                            </TextField>
                        </View>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                        >
                            {currencies.map((curr, index) => (
                                <Select.Item
                                    key={index}
                                    value={curr.code}
                                    label={curr.code}
                                >
                                    <View 
                                        style={{ 
                                            flexDirection: 'row', 
                                            gap: Layout.spacing * 4, 
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: INPUT_WIDTH,
                                            borderRadius: Layout.borderRadius,
                                            paddingHorizontal: curr.code === selectedCurrency.code ? Layout.spacing * 2 : 0,
                                            paddingVertical: curr.code === selectedCurrency.code ? Layout.spacing * 2 : 0,
                                            backgroundColor: curr.code === selectedCurrency.code ? '#23482f4b' : '',
                                        }}
                                    >
                                        <View style={{ 
                                                flexDirection: 'row',
                                                gap: Layout.spacing * 4, 
                                                alignItems: 'center', 
                                            }}
                                        >
                                            <View 
                                                style={{ 
                                                    backgroundColor: '#23482f', 
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderRadius: Layout.borderRadius,
                                                    width: 60,
                                                    height: 60,
                                                }}
                                            >
                                                <Text style={{ fontSize: 30, fontWeight: 900, color: foreground }}>
                                                    {getSymbol(curr.code)}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'column' }}>
                                                <Text style={{ color: foreground, fontSize: 25, fontWeight: 700 }}>
                                                    {curr.code}
                                                </Text>
                                                <Text style={{ color: muted, fontSize: 18 }}>
                                                    {curr.name}
                                                </Text>
                                            </View>
                                        </View>
                                        <Select.ItemIndicator />
                                    </View>
                                </Select.Item>
                            ))}
                        </ScrollView>
                    </View>
                </Select.Content>
            </BlurView>}
        </Select.Portal>
    </Select>
}

const CurrencyInput = ({ code, symbol }: { code: string, symbol: string }) => {
    const foreground = useThemeColor('foreground');

    return <TextField>
        <TextField.Label style={{ color: foreground, fontSize: 20 }}>Currency</TextField.Label>
        <TextField.Input 
            placeholder="USD ($)"
            editable={false}
            pointerEvents="none"
            className="rounded-full"
            value={`${code} (${symbol})`}
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

export default CurrencySelect;