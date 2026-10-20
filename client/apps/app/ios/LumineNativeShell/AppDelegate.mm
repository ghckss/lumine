#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <RNKakaoLogins.h>
#import <Security/Security.h>

static NSString *const LumineInstallMarkerKey = @"lumine.install.marker.v1";

static void LumineDeleteKeychainItemsForClass(CFStringRef itemClass)
{
  NSDictionary *query = @{
    (__bridge id)kSecClass: (__bridge id)itemClass
  };

  SecItemDelete((__bridge CFDictionaryRef)query);
}

static void LumineClearKeychainAfterFreshInstallIfNeeded(void)
{
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  if ([defaults boolForKey:LumineInstallMarkerKey]) {
    return;
  }

  LumineDeleteKeychainItemsForClass(kSecClassGenericPassword);
  LumineDeleteKeychainItemsForClass(kSecClassInternetPassword);
  LumineDeleteKeychainItemsForClass(kSecClassCertificate);
  LumineDeleteKeychainItemsForClass(kSecClassKey);
  LumineDeleteKeychainItemsForClass(kSecClassIdentity);

  [defaults setBool:YES forKey:LumineInstallMarkerKey];
}

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  LumineClearKeychainAfterFreshInstallIfNeeded();

  self.moduleName = @"LumineNativeShell";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  if ([RNKakaoLogins isKakaoTalkLoginUrl:url]) {
    return [RNKakaoLogins handleOpenUrl:url];
  }

  return [super application:application openURL:url options:options];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
