// Type declarations for modules without TypeScript definitions

declare module '@react-navigation/stack' {
  import type { ComponentType, ReactNode } from 'react';
  import type { StackNavigationOptions } from '@react-navigation/native-stack';
  
  export interface StackNavigationProp<ParamList extends object, RouteName extends keyof ParamList = keyof ParamList> {
    navigate: <Name extends keyof ParamList>(
      name: Name,
      params?: ParamList[Name]
    ) => void;
    goBack: () => void;
    reset: (state: { index: number; routes: { name: string; params?: any }[] }) => void;
    push: <Name extends keyof ParamList>(
      name: Name,
      params?: ParamList[Name]
    ) => void;
    pop: (count?: number) => void;
    popToTop: () => void;
    setOptions: (options: Partial<StackNavigationOptions>) => void;
    replace: <Name extends keyof ParamList>(
      name: Name,
      params?: ParamList[Name]
    ) => void;
  }
  
  export function createStackNavigator<ParamList extends object>(): {
    Navigator: ComponentType<{
      screenOptions?: StackNavigationOptions;
      initialRouteName?: keyof ParamList;
      children?: ReactNode;
    }>;
    Screen: ComponentType<{
      name: keyof ParamList;
      component: ComponentType<any>;
      options?: StackNavigationOptions | ((props: any) => StackNavigationOptions);
    }>;
    Group: ComponentType<{
      screenOptions?: StackNavigationOptions;
      children?: ReactNode;
    }>;
  };
  
  export interface StackNavigationOptions {
    headerShown?: boolean;
    title?: string;
    headerTitle?: string | (() => ReactNode);
    headerLeft?: () => ReactNode;
    headerRight?: () => ReactNode;
    headerStyle?: object;
    headerTitleStyle?: object;
    headerBackTitle?: string;
    headerBackTitleVisible?: boolean;
    gestureEnabled?: boolean;
    cardStyle?: object;
    presentation?: 'card' | 'modal' | 'transparentModal';
    animationEnabled?: boolean;
  }
  
  export { StackNavigationOptions as StackNavigationConfig };
}

declare module 'react-native-onboarding-swiper' {
  import type { ComponentType, ReactNode } from 'react';
  import type { StyleProp, ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';

  interface OnboardingPage {
    backgroundColor: string;
    image: ReactNode;
    title: string | ReactNode;
    subtitle: string | ReactNode;
    titleStyles?: StyleProp<TextStyle>;
    subTitleStyles?: StyleProp<TextStyle>;
  }

  interface OnboardingProps {
    pages: OnboardingPage[];
    onSkip?: () => void;
    onDone?: () => void;
    nextLabel?: string | ReactNode;
    skipLabel?: string | ReactNode;
    bottomBarHighlight?: boolean;
    bottomBarHeight?: number;
    containerStyles?: StyleProp<ViewStyle>;
    imageContainerStyles?: StyleProp<ViewStyle>;
    titleStyles?: StyleProp<TextStyle>;
    subTitleStyles?: StyleProp<TextStyle>;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    DoneButtonComponent?: ComponentType<any>;
    NextButtonComponent?: ComponentType<any>;
    SkipButtonComponent?: ComponentType<any>;
    DotComponent?: ComponentType<{ selected: boolean }>;
    controlStatusBar?: boolean;
    flatlistProps?: object;
  }

  const Onboarding: ComponentType<OnboardingProps>;
  export default Onboarding;
}

declare module 'react-native-splash-screen' {
  interface SplashScreen {
    show: () => void;
    hide: () => void;
  }
  
  const splashScreen: SplashScreen;
  export default splashScreen;
}

declare module '@jest/globals' {
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const test: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: (value: any) => {
    toBe: (expected: any) => void;
    toEqual: (expected: any) => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toBeNull: () => void;
    toBeUndefined: () => void;
    toBeDefined: () => void;
    toContain: (expected: any) => void;
    toHaveLength: (expected: number) => void;
    toThrow: (expected?: any) => void;
    not: any;
  };
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
  export const beforeAll: (fn: () => void | Promise<void>) => void;
  export const afterAll: (fn: () => void | Promise<void>) => void;
  export const jest: {
    fn: (implementation?: (...args: any[]) => any) => any;
    mock: (moduleName: string) => void;
    spyOn: (object: any, methodName: string) => any;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
  };
}

declare module 'react-test-renderer' {
  import type { ReactElement } from 'react';
  
  interface ReactTestRenderer {
    toJSON: () => any;
    toTree: () => any;
    update: (nextElement: ReactElement) => void;
    unmount: () => void;
    getInstance: () => any;
    root: any;
  }
  
  export function create(nextElement: ReactElement): ReactTestRenderer;
  export function act(callback: () => void | Promise<void>): void | Promise<void>;
}
