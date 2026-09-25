import { useInView } from 'react-intersection-observer';

export const useScrollReveal = (options = {}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    ...options
  });

  return { ref, isVisible: inView };
};

export default useScrollReveal;
