// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {combineLatest, of as of$, from as from$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {General, Permissions} from '@constants';
import {MAX_MESSAGE_LENGTH_FALLBACK} from '@constants/post_draft';
import {observeChannel, observeCurrentChannel} from '@queries/servers/channel';
import {queryAllCustomEmojis} from '@queries/servers/custom_emoji';
import {observeConfig, observeCurrentUserId} from '@queries/servers/system';
import {observeUser} from '@queries/servers/user';
import {hasPermissionForChannel} from '@utils/role';

import SendHandler from './send_handler';

import type {WithDatabaseArgs} from '@typings/database/database';

type OwnProps = {
    rootId: string;
    channelId: string;
    channelIsArchived?: boolean;
}

const enhanced = withObservables([], (ownProps: WithDatabaseArgs & OwnProps) => {
    const database = ownProps.database;
    const {rootId, channelId} = ownProps;
    let channel;
    if (rootId) {
        channel = observeChannel(database, channelId);
    } else {
        channel = observeCurrentChannel(database);
    }

    const currentUserId = observeCurrentUserId(database);
    const currentUser = currentUserId.pipe(
        switchMap((id) => observeUser(database, id),
        ));
    const userIsOutOfOffice = currentUser.pipe(
        switchMap((u) => of$(u?.status === General.OUT_OF_OFFICE)),
    );

    const config = observeConfig(database);
    const enableConfirmNotificationsToChannel = config.pipe(
        switchMap((cfg) => of$(Boolean(cfg?.EnableConfirmNotificationsToChannel === 'true'))),
    );
    const isTimezoneEnabled = config.pipe(
        switchMap((cfg) => of$(Boolean(cfg?.ExperimentalTimezone === 'true'))),
    );
    const maxMessageLength = config.pipe(
        switchMap((cfg) => of$(parseInt(cfg?.MaxPostSize || '0', 10) || MAX_MESSAGE_LENGTH_FALLBACK)),
    );

    const useChannelMentions = combineLatest([channel, currentUser]).pipe(
        switchMap(([c, u]) => {
            if (!c) {
                return of$(true);
            }

            return u ? from$(hasPermissionForChannel(c, u, Permissions.USE_CHANNEL_MENTIONS, false)) : of$(false);
        }),
    );

    const channelInfo = channel.pipe(switchMap((c) => (c ? c.info.observe() : of$(undefined))));
    const membersCount = channelInfo.pipe(
        switchMap((i) => (i ? of$(i.memberCount) : of$(0))),
    );

    const customEmojis = queryAllCustomEmojis(database).observe();

    return {
        currentUserId,
        enableConfirmNotificationsToChannel,
        isTimezoneEnabled,
        maxMessageLength,
        membersCount,
        userIsOutOfOffice,
        useChannelMentions,
        customEmojis,
    };
});

export default withDatabase(enhanced(SendHandler));