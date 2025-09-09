function useDebounce(fn, delay) {
  let timer;
  return (...arg) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...arg);
    }, delay);
  };
}

export default useDebounce;
