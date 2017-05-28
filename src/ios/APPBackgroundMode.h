/*
*/

#import <AVFoundation/AVFoundation.h>
#import <Cordova/CDVPlugin.h>

@interface APPBackgroundMode : CDVPlugin {
    AVAudioPlayer* audioPlayer;
    AVAudioSession* audioSession;
    BOOL enabled;   
}

// Activate the background mode
- (void) enable:(CDVInvokedUrlCommand*)command;
// Deactivate the background mode
- (void) disable:(CDVInvokedUrlCommand*)command;

@end
