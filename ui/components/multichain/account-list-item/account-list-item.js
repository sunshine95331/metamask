import React, { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { useSelector } from 'react-redux';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { shortenAddress } from '../../../helpers/utils/util';

import { AccountListItemMenu, AvatarGroup } from '..';
import { ConnectedAccountsMenu } from '../connected-accounts-menu';
import {
  AvatarAccount,
  AvatarAccountVariant,
  AvatarFavicon,
  AvatarToken,
  AvatarTokenSize,
  Box,
  ButtonIcon,
  Icon,
  IconName,
  IconSize,
  Tag,
  Text,
} from '../../component-library';
import {
  AlignItems,
  BackgroundColor,
  BlockSize,
  BorderColor,
  BorderRadius,
  Color,
  Display,
  FlexDirection,
  JustifyContent,
  Size,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { KeyringType } from '../../../../shared/constants/keyring';
import UserPreferencedCurrencyDisplay from '../../app/user-preferenced-currency-display/user-preferenced-currency-display.component';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import { getNativeCurrency } from '../../../ducks/metamask/metamask';
import Tooltip from '../../ui/tooltip/tooltip';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  getAddressConnectedSubjectMap,
  getCurrentNetwork,
  getNativeCurrencyImage,
  getShowFiatInTestnets,
  getUseBlockie,
} from '../../../selectors';
import { useAccountTotalFiatBalance } from '../../../hooks/useAccountTotalFiatBalance';
import { TEST_NETWORKS } from '../../../../shared/constants/network';
import { ConnectedStatus } from '../connected-status/connected-status';
import { toChecksumHexAddress } from '../../../../shared/modules/hexstring-utils';
///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
import { getCustodianIconForAddress } from '../../../selectors/institutional/selectors';
///: END:ONLY_INCLUDE_IF
import { AccountListItemMenuTypes } from './account-list-item.types';

const MAXIMUM_CURRENCY_DECIMALS = 3;
const MAXIMUM_CHARACTERS_WITHOUT_TOOLTIP = 17;

export const AccountListItem = ({
  identity,
  selected = false,
  onClick,
  closeMenu,
  accountsCount,
  connectedAvatar,
  connectedAvatarName,
  isPinned = false,
  menuType = AccountListItemMenuTypes.None,
  isHidden = false,
  currentTabOrigin,
  isActive = false,
  startAccessory,
  onActionClick,
}) => {
  const t = useI18nContext();
  const [accountOptionsMenuOpen, setAccountOptionsMenuOpen] = useState(false);
  const [accountListItemMenuElement, setAccountListItemMenuElement] =
    useState();

  const useBlockie = useSelector(getUseBlockie);
  const currentNetwork = useSelector(getCurrentNetwork);
  const setAccountListItemMenuRef = (ref) => {
    setAccountListItemMenuElement(ref);
  };
  const showFiatInTestnets = useSelector(getShowFiatInTestnets);
  const showFiat =
    TEST_NETWORKS.includes(currentNetwork?.nickname) && !showFiatInTestnets;
  const { totalWeiBalance, orderedTokenList } = useAccountTotalFiatBalance(
    identity.address,
  );
  const mappedOrderedTokenList = orderedTokenList.map((item) => ({
    avatarValue: item.iconUrl,
  }));
  let balanceToTranslate = totalWeiBalance;
  if (showFiat) {
    balanceToTranslate = identity.balance;
  }

  ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
  const custodianIcon = useSelector((state) =>
    getCustodianIconForAddress(state, identity.address),
  );
  ///: END:ONLY_INCLUDE_IF

  // If this is the selected item in the Account menu,
  // scroll the item into view
  const itemRef = useRef(null);
  useEffect(() => {
    if (selected) {
      itemRef.current?.scrollIntoView?.();
    }
  }, [itemRef, selected]);

  const trackEvent = useContext(MetaMetricsContext);
  const primaryTokenImage = useSelector(getNativeCurrencyImage);
  const nativeCurrency = useSelector(getNativeCurrency);
  const addressConnectedSubjectMap = useSelector(getAddressConnectedSubjectMap);
  const selectedAddressSubjectMap =
    addressConnectedSubjectMap[identity.address];
  const currentTabIsConnectedToSelectedAddress = Boolean(
    selectedAddressSubjectMap && selectedAddressSubjectMap[currentTabOrigin],
  );
  const isConnected =
    currentTabOrigin && currentTabIsConnectedToSelectedAddress;
  const isSingleAccount = accountsCount === 1;

  return (
    <Box
      display={Display.Flex}
      padding={4}
      backgroundColor={selected ? Color.primaryMuted : Color.transparent}
      className={classnames('multichain-account-list-item', {
        'multichain-account-list-item--selected': selected,
        'multichain-account-list-item--connected': Boolean(connectedAvatar),
        'multichain-account-list-item--clickable': Boolean(onClick),
      })}
      ref={itemRef}
      onClick={() => {
        // Without this check, the account will be selected after
        // the account options menu closes
        if (!accountOptionsMenuOpen) {
          onClick?.();
        }
      }}
    >
      {startAccessory ? (
        <Box marginInlineEnd={2} marginTop={1}>
          {startAccessory}
        </Box>
      ) : null}
      {selected && (
        <Box
          className="multichain-account-list-item__selected-indicator"
          borderRadius={BorderRadius.pill}
          backgroundColor={Color.primaryDefault}
        />
      )}
      {process.env.MULTICHAIN ? (
        <>
          <Box
            display={[Display.Flex, Display.None]}
            data-testid="account-list-item-badge"
          >
            <ConnectedStatus address={identity.address} isActive={isActive} />
          </Box>
          <Box display={[Display.None, Display.Flex]}>
            {
              ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
              <AvatarAccount
                borderColor={BorderColor.transparent}
                size={Size.MD}
                address={identity.address}
                variant={
                  useBlockie
                    ? AvatarAccountVariant.Blockies
                    : AvatarAccountVariant.Jazzicon
                }
                marginInlineEnd={2}
              />
              ///: END:ONLY_INCLUDE_IF
            }

            {
              ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
              custodianIcon ? (
                <img
                  src={custodianIcon}
                  data-testid="custody-logo"
                  className="custody-logo"
                  alt="custody logo"
                />
              ) : (
                <AvatarAccount
                  borderColor={BorderColor.transparent}
                  size={Size.MD}
                  address={identity.address}
                  variant={
                    useBlockie
                      ? AvatarAccountVariant.Blockies
                      : AvatarAccountVariant.Jazzicon
                  }
                  marginInlineEnd={2}
                />
              )
              ///: END:ONLY_INCLUDE_IF
            }
          </Box>
        </>
      ) : (
        <>
          {
            ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
            <AvatarAccount
              borderColor={BorderColor.transparent}
              size={Size.MD}
              address={identity.address}
              variant={
                useBlockie
                  ? AvatarAccountVariant.Blockies
                  : AvatarAccountVariant.Jazzicon
              }
              marginInlineEnd={2}
            />
            ///: END:ONLY_INCLUDE_IF
          }
          {
            ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
            custodianIcon ? (
              <img
                src={custodianIcon}
                data-testid="custody-logo"
                className="list-item-custody-logo"
                alt="custody logo"
              />
            ) : (
              <AvatarAccount
                borderColor={BorderColor.transparent}
                size={Size.MD}
                address={identity.address}
                variant={
                  useBlockie
                    ? AvatarAccountVariant.Blockies
                    : AvatarAccountVariant.Jazzicon
                }
                marginInlineEnd={2}
              />
            )
            ///: END:ONLY_INCLUDE_IF
          }
        </>
      )}
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        className="multichain-account-list-item__content"
      >
        <Box display={Display.Flex} flexDirection={FlexDirection.Column}>
          <Box
            display={Display.Flex}
            justifyContent={JustifyContent.spaceBetween}
          >
            <Box
              className="multichain-account-list-item__account-name"
              marginInlineEnd={2}
              display={Display.Flex}
              alignItems={AlignItems.center}
              gap={2}
            >
              {isPinned ? (
                <Icon
                  name={IconName.Pin}
                  size={IconSize.Xs}
                  className="account-pinned-icon"
                />
              ) : null}
              {isHidden ? (
                <Icon
                  name={IconName.EyeSlash}
                  size={IconSize.Xs}
                  className="account-hidden-icon"
                />
              ) : null}
              <Text
                as="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
                variant={TextVariant.bodyMdMedium}
                className="multichain-account-list-item__account-name__button"
                padding={0}
                backgroundColor={BackgroundColor.transparent}
                width={BlockSize.Full}
                textAlign={TextAlign.Left}
                ellipsis
              >
                {identity.metadata.name.length >
                MAXIMUM_CHARACTERS_WITHOUT_TOOLTIP ? (
                  <Tooltip
                    title={identity.metadata.name}
                    position="bottom"
                    wrapperClassName="multichain-account-list-item__tooltip"
                  >
                    {identity.metadata.name}
                  </Tooltip>
                ) : (
                  identity.metadata.name
                )}
              </Text>
            </Box>
            <Text
              as="div"
              className="multichain-account-list-item__asset"
              display={Display.Flex}
              flexDirection={FlexDirection.Row}
              alignItems={AlignItems.center}
              justifyContent={JustifyContent.flexEnd}
              ellipsis
              textAlign={TextAlign.End}
            >
              <UserPreferencedCurrencyDisplay
                ethNumberOfDecimals={MAXIMUM_CURRENCY_DECIMALS}
                value={balanceToTranslate}
                type={PRIMARY}
                showFiat={
                  !showFiat || !TEST_NETWORKS.includes(currentNetwork?.nickname)
                }
              />
            </Text>
          </Box>
        </Box>
        <Box
          display={Display.Flex}
          justifyContent={JustifyContent.spaceBetween}
        >
          <Box display={Display.Flex} alignItems={AlignItems.center}>
            {connectedAvatar ? (
              <AvatarFavicon
                size={Size.XS}
                src={connectedAvatar}
                name={connectedAvatarName}
                className="multichain-account-list-item__avatar"
              />
            ) : null}
            <Text variant={TextVariant.bodySm} color={Color.textAlternative}>
              {shortenAddress(toChecksumHexAddress(identity.address))}
            </Text>
          </Box>
          {mappedOrderedTokenList.length > 1 ? (
            <AvatarGroup members={mappedOrderedTokenList} limit={4} />
          ) : (
            <Box
              display={Display.Flex}
              alignItems={AlignItems.center}
              justifyContent={JustifyContent.center}
              gap={1}
              className="multichain-account-list-item__avatar-currency"
            >
              <AvatarToken
                src={primaryTokenImage}
                name={nativeCurrency}
                size={AvatarTokenSize.Xs}
                borderColor={BorderColor.borderDefault}
              />
              <Text
                variant={TextVariant.bodySm}
                color={TextColor.textAlternative}
                textAlign={TextAlign.End}
                as="div"
              >
                <UserPreferencedCurrencyDisplay
                  ethNumberOfDecimals={MAXIMUM_CURRENCY_DECIMALS}
                  value={identity.balance}
                  type={SECONDARY}
                  showNative
                />
              </Text>
            </Box>
          )}
        </Box>
        {identity.label ? (
          <Tag
            label={identity.label}
            labelProps={{
              variant: TextVariant.bodyXs,
              color: Color.textAlternative,
            }}
            startIconName={
              identity.metadata.keyring.type === KeyringType.snap
                ? IconName.Snaps
                : null
            }
          />
        ) : null}
      </Box>

      {menuType === AccountListItemMenuTypes.None ? null : (
        <ButtonIcon
          ariaLabel={`${identity.metadata.name} ${t('options')}`}
          iconName={IconName.MoreVertical}
          size={IconSize.Sm}
          ref={setAccountListItemMenuRef}
          onClick={(e) => {
            e.stopPropagation();
            if (!accountOptionsMenuOpen) {
              trackEvent({
                event: MetaMetricsEventName.AccountDetailMenuOpened,
                category: MetaMetricsEventCategory.Navigation,
                properties: {
                  location: 'Account Options',
                },
              });
            }
            setAccountOptionsMenuOpen(!accountOptionsMenuOpen);
          }}
          data-testid="account-list-item-menu-button"
        />
      )}
      {menuType === AccountListItemMenuTypes.Account && (
        <AccountListItemMenu
          anchorElement={accountListItemMenuElement}
          identity={identity}
          onClose={() => setAccountOptionsMenuOpen(false)}
          isOpen={accountOptionsMenuOpen}
          isRemovable={identity.keyring.type !== KeyringType.hdKeyTree}
          closeMenu={closeMenu}
          isPinned={isPinned}
          isHidden={isHidden}
          isConnected={isConnected}
        />
      )}
      {menuType === AccountListItemMenuTypes.Connection && (
        <ConnectedAccountsMenu
          anchorElement={accountListItemMenuElement}
          identity={identity}
          onClose={() => setAccountOptionsMenuOpen(false)}
          closeMenu={closeMenu}
          disableAccountSwitcher={isSingleAccount}
          isOpen={accountOptionsMenuOpen}
          onActionClick={onActionClick}
          activeTabOrigin={currentTabOrigin}
        />
      )}
    </Box>
  );
};

AccountListItem.propTypes = {
  /**
   * An account object that has name, address, and balance data
   */
  identity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
    metadata: PropTypes.shape({
      name: PropTypes.string.isRequired,
      snap: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        enabled: PropTypes.bool,
      }),
      keyring: PropTypes.shape({
        type: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    keyring: PropTypes.shape({
      type: PropTypes.string.isRequired,
    }).isRequired,
    label: PropTypes.string,
  }).isRequired,
  /**
   * Represents if this account is currently selected
   */
  selected: PropTypes.bool,
  /**
   * Function to execute when the item is clicked
   */
  onClick: PropTypes.func,
  /**
   * Represents how many accounts are being listed
   */
  accountsCount: PropTypes.number,
  /**
   * Function that closes the menu
   */
  closeMenu: PropTypes.func,
  /**
   * Function to set account name to show disconnect toast when an account is disconnected
   */
  onActionClick: PropTypes.func,
  /**
   * File location of the avatar icon
   */
  connectedAvatar: PropTypes.string,
  /**
   * Text used as the avatar alt text
   */
  connectedAvatarName: PropTypes.string,
  /**
   * Represents the type of menu to be rendered
   */
  menuType: PropTypes.string,
  /**
   * Represents pinned accounts
   */
  isPinned: PropTypes.bool,
  /**
   * Represents hidden accounts
   */
  isHidden: PropTypes.bool,
  /**
   * Represents current tab origin
   */
  currentTabOrigin: PropTypes.string,
  /**
   * Represents active accounts
   */
  isActive: PropTypes.bool,
  /**
   * Represents start accessory
   */
  startAccessory: PropTypes.node,
};

AccountListItem.displayName = 'AccountListItem';
