// Gestion du clavier : calcule de combien le clavier recouvre une zone de l'écran.
// Sur Android récent (affichage bord à bord), l'écran ne se redimensionne plus
// tout seul quand le clavier s'ouvre : on ajoute donc nous-mêmes l'espace nécessaire.
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

const SHOW = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

// Renvoie { ref, overlap } : mettre ref sur la vue à protéger,
// overlap = hauteur (en points) cachée par le clavier, 0 si le clavier est fermé.
export function useKeyboardOverlap() {
  const ref = useRef(null);
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(SHOW, (e) => {
      const keyboardTop = e.endCoordinates.screenY;
      const view = ref.current;
      if (!view || !view.measureInWindow) {
        setOverlap(e.endCoordinates.height);
        return;
      }
      view.measureInWindow((x, y, w, h) => {
        // Si le système a déjà réduit l'écran, la vue s'arrête au-dessus du clavier : rien à ajouter
        setOverlap(Math.max(0, Math.round(y + h - keyboardTop)));
      });
    });
    const hide = Keyboard.addListener(HIDE, () => setOverlap(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return { ref, overlap };
}

// Appelle fn à chaque ouverture du clavier
export function useOnKeyboardShow(fn) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    const sub = Keyboard.addListener(SHOW, () => saved.current());
    return () => sub.remove();
  }, []);
}

export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener(SHOW, () => setOpen(true));
    const b = Keyboard.addListener(HIDE, () => setOpen(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  return open;
}

export const dismissKeyboard = () => Keyboard.dismiss();
