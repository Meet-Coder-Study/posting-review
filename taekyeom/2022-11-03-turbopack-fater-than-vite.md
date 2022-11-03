# Turbopack은 정말로 Vite 보다 10배 빠른가요?

## [Introducing Turbopack, the successor to Webpack.](https://twitter.com/vercel/status/1584961746418208774?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1584961746418208774%7Ctwgr%5Ec65f761d0768497ce9d0eb3febc2942e9dad8a11%7Ctwcon%5Es1_&ref_url=https%3A%2F%2Ftechrecipe.co.kr%2Fposts%2F46970)

- Webpack 보다 700배 빠름
- Vite 보다 10배 빠름

1주일전에 Vercel에서 Turbopack을 발표했고 내세운 메세지 중 하나가 Vite 보다 10배 빠름!!!

그에 따른 Evan You의 반응

## [Is Turbopack really 10x Faster than Vite?](https://github.com/yyx990803/vite-vs-next-turbo-hmr/discussions/8)

[turbopack](https://turbo.build/blog/turbopack-benchmarks#bench)에서 보니 Next 13 + Turbopack이 React HMR을 0.01초 걸린데 반해, Vite는 0.09초 걸렸다

하지만 다른 성능에서 10배 빠른 것은 없고 10배 더 빠르다는 주장이 HMR에서만 해당한다. 그리고 이러한 수치를 구한 방법을 제시하지 않았다.

그래서 내가 Next 13과 Vite 3.2를 직접 비교하겠다 [vite-vs-next-turbo-hmr](https://github.com/yyx990803/vite-vs-next-turbo-hmr)

### SWC vs Babel

React HMR 및 JSX 변환을 위해 Babel을 사용하고 있다. Esbuild는 JSX 변환할 수 있지만 HMR에 대한 지원이 부족하다.

Vite가 Babel을 사용하는 이유는 SWC가 너무 무겁기 때문이다 (Vite가 19MB인데 SWC가 58MB)

그래서 똑같은 SWC를 이용하면 차이가 거의 없다.

내 환경은 M1 Mackbook Pro였다. 다양한 하드웨어에서는 Vite가 뛰어나게 나오는 곳도 있다

그러니 공정한 비교를 해라
