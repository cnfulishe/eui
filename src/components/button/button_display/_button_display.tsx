/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, {
  forwardRef,
  CSSProperties,
  ReactNode,
  Ref,
  ButtonHTMLAttributes,
} from 'react';

// @ts-ignore module doesn't export `createElement`
import { createElement } from '@emotion/react';
import { getSecureRelForTarget, useEuiTheme } from '../../../services';

import {
  CommonProps,
  ExclusiveUnion,
  PropsForAnchor,
  PropsForButton,
} from '../../common';

import { euiButtonDisplayStyles } from './_button_display.styles';
import {
  EuiButtonDisplayContent,
  EuiButtonDisplayContentProps,
  EuiButtonDisplayContentType,
} from './_button_display_content';
import { validateHref } from '../../../services/security/href_validator';
import { useEuiButtonRadiusCSS } from '../../../themes/amsterdam/global_styling/mixins';

const SIZES = ['xs', 's', 'm'] as const;
export type EuiButtonDisplaySizes = typeof SIZES[number];

/**
 * Extends EuiButtonDisplayContentProps which provides
 * `iconType`, `iconSide`, and `textProps`
 */
export interface EuiButtonDisplayCommonProps
  extends EuiButtonDisplayContentProps,
    CommonProps {
  children?: ReactNode;
  size?: EuiButtonDisplaySizes;
  /**
   * Applies the boolean state as the `aria-pressed` property to create a toggle button.
   * *Only use when the readable text does not change between states.*
   */
  isSelected?: boolean;
  /**
   * Extends the button to 100% width
   */
  fullWidth?: boolean;
  /**
   * Override the default minimum width
   */
  minWidth?: CSSProperties['minWidth'];
  /**
   * Force disables the button and changes the icon to a loading spinner
   */
  isLoading?: boolean;
  /**
   * Object of props passed to the <span/> wrapping the button's content
   */
  contentProps?: CommonProps & EuiButtonDisplayContentType;
  style?: CSSProperties;
}

export type EuiButtonDisplayPropsForAnchor = PropsForAnchor<
  EuiButtonDisplayCommonProps,
  {
    buttonRef?: Ref<HTMLAnchorElement>;
  }
>;

export type EuiButtonDisplayPropsForButton = PropsForButton<
  EuiButtonDisplayCommonProps,
  {
    buttonRef?: Ref<HTMLButtonElement>;
  }
>;

export type EuiButtonDisplayProps = ExclusiveUnion<
  EuiButtonDisplayPropsForAnchor,
  EuiButtonDisplayPropsForButton
>;

export function isButtonDisabled({
  href,
  isDisabled,
  isLoading,
}: {
  href?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
}) {
  const isHrefValid = !href || validateHref(href);
  return isLoading || isDisabled || !isHrefValid;
}

/**
 * EuiButtonDisplay is an internal-only component used for displaying
 * any element as a button.
 */
export const EuiButtonDisplay = forwardRef<HTMLElement, EuiButtonDisplayProps>(
  (
    {
      children,
      iconType,
      iconSide,
      size = 'm',
      isDisabled,
      disabled,
      isLoading,
      isSelected,
      fullWidth,
      minWidth,
      contentProps,
      textProps,
      href,
      target,
      rel,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const buttonIsDisabled = isButtonDisabled({
      href,
      isDisabled: isDisabled || disabled,
      isLoading,
    });

    const minWidthPx: string =
      typeof minWidth === 'number' ? `${minWidth}px` : (minWidth as string);

    const theme = useEuiTheme();

    const styles = euiButtonDisplayStyles(theme, minWidthPx);
    const buttonRadiusStyle = useEuiButtonRadiusCSS()[size];
    const cssStyles = [
      styles.euiButtonDisplay,
      styles[size],
      fullWidth && styles.fullWidth,
      buttonIsDisabled && styles.isDisabled,
      buttonRadiusStyle,
    ];

    const innerNode = (
      <EuiButtonDisplayContent
        isLoading={isLoading}
        isDisabled={buttonIsDisabled}
        iconType={iconType}
        iconSide={iconSide}
        textProps={{ ...textProps }}
        {...contentProps}
      >
        {children}
      </EuiButtonDisplayContent>
    );

    const element = href && !buttonIsDisabled ? 'a' : 'button';
    let elementProps = {};
    // Element-specific attributes
    if (element === 'button') {
      elementProps = {
        ...elementProps,
        disabled: buttonIsDisabled,
        'aria-pressed': isSelected,
      };
    }

    const relObj: {
      rel?: string;
      href?: string;
      type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
      target?: string;
    } = {};

    if (href && !buttonIsDisabled) {
      relObj.href = href;
      relObj.rel = getSecureRelForTarget({ href, target, rel });
      relObj.target = target;
    } else {
      relObj.type = type as ButtonHTMLAttributes<HTMLButtonElement>['type'];
    }

    return createElement(
      element,
      {
        css: cssStyles,
        ref,
        ...elementProps,
        ...relObj,
        ...rest,
      },
      innerNode
    );
  }
);

EuiButtonDisplay.displayName = 'EuiButtonDisplay';
