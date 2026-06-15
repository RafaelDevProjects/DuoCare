import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export async function solicitarPermissaoGaleria(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua galeria para escolher uma foto.');
      return false;
    }
    return true;
  }
  return true;
}

export async function solicitarPermissaoCamera(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua câmera para tirar uma foto.');
      return false;
    }
    return true;
  }
  return true;
}

export async function selecionarImagem(fromCamera: boolean): Promise<string | null> {
  try {
    let result;
    const options: any = {
      mediaTypes: ['images'], // 🔁 array, compatível com versão 15.x
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    };

    if (fromCamera) {
      const hasPermission = await solicitarPermissaoCamera();
      if (!hasPermission) return null;
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      const hasPermission = await solicitarPermissaoGaleria();
      if (!hasPermission) return null;
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets[0].base64) {
      return `data:image/jpeg;base64,${result.assets[0].base64}`;
    }
    return null;
  } catch (error) {
    console.error('Erro ao selecionar imagem:', error);
    Alert.alert('Erro', 'Não foi possível obter a imagem.');
    return null;
  }
}