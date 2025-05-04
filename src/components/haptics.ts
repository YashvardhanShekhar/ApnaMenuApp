import RNHapticFeedback from "react-native-haptic-feedback";

export const Haptic = ()=>{
    RNHapticFeedback.trigger('impactLight', {
      enableVibrateFallback: true,
    });
}