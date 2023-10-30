// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';
import {View, type ViewStyle} from 'react-native';

import Button from '@app/components/button';
import {useTheme} from '@app/context/theme';
import {popTopScreen} from '@app/screens/navigation';

import MessageBox from '../message_box/message_box';

type Props = {
    containerStyles: ViewStyle;
}

export const NoCommonTeamForm = ({
    containerStyles,
}: Props) => {
    const theme = useTheme();
    const {formatMessage} = useIntl();

    const header = formatMessage({
        id: 'channel_info.convert_gm_to_channel.warning.no_teams.header',
        defaultMessage: 'Unable to convert to a channel because group members are part of different teams',
    });

    const body = formatMessage({
        id: 'channel_info.convert_gm_to_channel.warning.no_teams.body',
        defaultMessage: 'Group Message cannot be converted to a channel because members are not a part of the same team. Add all members to a single team to convert this group message to a channel.',
    });

    const handleOnPress = useCallback(() => {
        popTopScreen();
    }, []);

    const buttonText = formatMessage({
        id: 'generic.back',
        defaultMessage: 'back',
    });

    return (
        <View style={containerStyles}>
            <MessageBox
                header={header}
                body={body}
                type='danger'
            />
            <Button
                onPress={handleOnPress}
                text={buttonText}
                theme={theme}
                size='lg'
            />
        </View>
    );
};