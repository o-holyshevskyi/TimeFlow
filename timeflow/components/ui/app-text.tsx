import { Text, TextProps } from 'react-native';

export function AppText(props: TextProps) {
    return (
        <Text
            {...props}
            allowFontScaling={false}
            maxFontSizeMultiplier={1.1}
            style={[{ fontFamily: 'System' }, props.style]}
        />
    );
}
