import RNHapticFeedback from "react-native-haptic-feedback";

export const Haptic = ()=>{
    RNHapticFeedback.trigger('impactLight', {
      enableVibrateFallback: true,
    });
}

export const HapticHeavy = ()=>{
    RNHapticFeedback.trigger('impactHeavy', {
      enableVibrateFallback: true,
    });
}

export const HapticMedium = ()=>{
    RNHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
    });
}