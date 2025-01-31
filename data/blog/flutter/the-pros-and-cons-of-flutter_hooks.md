---
title: 'flutter_hooks 的优劣势'
date: 2025-01-31
tags: ['hook', 'flutter']
summary: '文章讲述在 Flutter 中使用 hooks 的优劣势，探讨是否有必要在项目中引入 hooks。'
type: Blog
---

<TOCInline toc={props.toc} asDisclosure />

> 本文不会介绍和 [flutter_hooks](https://pub.dev/packages/flutter_hooks) 官方文档重复的内容。

flutter_hooks 是 React Hooks 的 Flutter 实现，它提供了一种新的方式来管理 Flutter 的状态和生命周期。如同 React 函数组件之与类组件，提供了一种更加简洁、易用的状态管理方式。但这种方式不像 React Hooks 一样是一等公民，所以在 Flutter 中使用 Hooks 会显得有些不伦不类。正因如此，我们需要足够的理论在 Flutter 中引入 Hooks。

函数组件相对与类组件，在 Flutter 中则是 `StatefulWidget` 而言，代码会变得很简洁，这是最明显的优势。Hooks 在 Element 中维护自身的生命周期，使得使用 Hooks 初始化的变量无需手动销毁，开发者因此可以减少很多模板代码。内置的 Hooks 在 Flutter 原生都有对应的一套解决方案。下面的一章会逐个介绍一些核心 Hooks。

## Hooks vs `StatefulWidget`

### `useState`

`useState` 是一个状态的 Hook，它可以在函数组件中创建一个状态。在 Flutter 中，相当于在 State 中创建一个变量。

Flutter 版本：

```dart
class FooState extends State<Foo> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Text('$count');
  }

  onClick() {
    setState(() {
      count++;
    });
  }
}
```

对应的 Hooks 版本：

```dart
build() {
  final count = useState(0);

  onClick() {
    count.value++;
  }

  return Text('${count.value}');
}
```

### `useEffect`

`useEffect` 是一个副作用的 Hook，它的一个作用是在组件挂载和销毁时执行。在 Flutter 中，我们可以使用 `useEffect` 来模拟 `initState` 和 `dispose` 方法。

Flutter 版本：

```dart
class FooState extends State<Foo> {
  @override
  void initState() {
    super.initState();
    // 初始化
  }

  @override
  void dispose() {
    // 销毁
    super.dispose();
  }
}
```

对应的 Hooks 版本：

```dart
build() {
  useEffect(() {
      // 初始化
      return () {
        // 销毁
      };
  }, []);
}
```

`useEffect` 通常还有另一个作用，就是监听某个变量的变化，当变量发生变化时，执行某个操作，这取决于它的第二个参数「依赖项」。上例中，无依赖项传入空数组，表示只在组件挂载和销毁时执行。继续对比一个计算 sum 值的代码对比。

Flutter 版本：

```dart
class FooState extends State<Foo> {
  int a = 0;
  int b = 0;
  int sum = 0;

  updateA(int val) {
    setState(() {
      a = val;
      sum = a + b;
    });
  }

  updateB(int val) {
    setState(() {
      b = val;
      sum = a + b;
    });
  }
}
```

对应的 Hooks 版本：

```dart
build() {
  final a = useState(0);
  final b = useState(0);
  final sum = useState(0);

  useEffect(() {
    sum.value = a.value + b.value;
  }, [a, b]);
}
```

### `useMemoized`

`useMemoized` 是一个记忆的 Hook，它可以缓存一个函数的返回值，当依赖项发生变化时，重新计算。这个 Hook 在 Flutter 不需要等价实现，它是函数组件衍生出来的场景。

在 `StatefulWidget` 中，想要一个值重新计算，在需要的时候手动更新它就好了，但是在函数组件中，逻辑都在 build 中，如果在这里计算高成本的值，会导致性能问题。`useMemoized` 就是为了解决这个问题。

例如，我们有一个计算斐波那契数列的函数：

```dart
int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

在 hook 中，如果直接在 build 里计算：

```dart
build() {
  final result = fibonacci(n);
}
```

每次 build 都会重新计算，这显然是不合理的。我们可以使用 `useMemoized` 来缓存结果：

```dart
build() {
  final result = useMemoized(() => fibonacci(n), [n]);
}
```

`useMemoized` 的第二个参数和 `useEffect` 一样，会在依赖项变化时重新计算，此处 n 发生变化时重新计算，否则返回缓存的值。

### `useRef`

`useRef` 是一个引用的 Hook，它可以在函数组件中创建一个引用。它在 Flutter 中也不需要等价实现，也是为了解决函数组件的需求场景。

在 `StatefulWidget` 中，我们可以直接创建一个变量，然后在整个生命周期中使用：

```dart
class FooState extends State<Foo> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Text('$count');
  }

  onClick() {
    count++;
  }
}
```

但是在函数组件中，我们无法直接创建一个变量，因为每次 build 都会重新初始化。这时候就需要 `useRef`：

```dart
build() {
  final count = useRef(0);

  onClick() {
    count.current++;
  }

  return Text('${count.current}');
}
```

从上面的代码看，`useRef` 和 `useState` 几乎一样，它们不同的地方在于。给 `useState` 创建的变量赋值会触发 rebuild，而给 `useRef` 创建的变量赋值不会触发 rebuild，和是否调用了 `setState` 一样。

### `useCallback`

`useCallback` 是一个回调的 Hook，它可以缓存一个回调函数，当依赖项发生变化时，重新计算。这个 Hook 与 `useMemoized` 有些类似，一个是缓存值，一个是缓存函数。事实上，`useCallback` 就是 `useMemoized` 的特例。

```dart
build() {
  final callback = useCallback(callback, []);
  final callback = useMemoized(() => callback, []);
}
```

上述的两种写法是等价的，`useCallback` 是 `useMemoized` 的语法糖。

由于函数组件，所有代码都在 build 函数体内，如果在这里一直实例化新的函数，会导致每次 diff 结果都不一样，那么对应的子组件就需要被 rebuild。也就是说这个场景主要优化的是 build 性能，不是函数创建的效率。

## 其他 hooks

上一节包含了函数组件最重要的几个 hooks，除此之外，还有一些 hooks 可以用于简化代码，例如，如果监听一个流，使用 `StatefulWidget` 会显得很冗余：

```dart
class FooState extends State<Foo> {
  StreamSubscription _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = stream.listen((event) {
      // do something
    });
  }

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
```

如果用 `useEffect` 实现会简洁很多：

```dart
build() {
  useEffect(() {
    final subscription = stream.listen((event) {
      // do something
    });
    return subscription.cancel;
  }, []);
}
```

hooks 中包含了更多的语法糖，其中一个 `useStream` 可以直接监听一个流：

```dart
build() {
  final data = useStream(stream);
}
```

此外，hooks 还包含了一些其他的 hooks，例如 `useAnimationController`、`useAnimation`、`useTextEditingController` 等等，这些 hooks 都是为了简化代码，减少模板代码。不在一一赘述，查看[flutter_hooks 官方文档](https://pub.dev/packages/flutter_hooks) 即可。

## 与 Riverpod 结合

[Riverpod](https://pub.dev/packages/riverpod) 依赖于 hooks，不过它没有导出 hooks，而是让用户自行决定是否使用 hooks。在复杂的应用中，如果用了 Riverpod，不使用 hooks 可能会让一些业务场景变得难以实现，例如 Riverpod 伪代码：

```dart
build(context) {
  final count = useCounter();

  return Button(onTap: doSomethingWithCount);
}

doSomethingWithCount() {
  // unable to access count
}
```

StatefulWidget 的成员函数无法访问 `counter` 变量，当然这个场景有很多方式解决，例如将 `counter` 传递给 `doSomethingWithCount`，或者通过 Riverpod 获取 `counter`。但是场景继续复杂化，就可能会变得更麻烦。而且这种既有函数组件风格又有类组件风格显得有些不伦不类。如果统一成函数组件风格，可以做更多的事情，例如用 `useEffect` 监听 `counter` 的变化等：

```dart
build() {
  final count = useCounter();

  useEffect(() {
    // do something with count
  }, [count]);
}
```

## hooks 的顺序不能改变

虽然官方文档有链接到一篇解释原理的文章 [React hooks: not magic, just arrays](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)。这里也再次提起，hooks 的顺序是很重要的，改变顺序会导致错误。而改变顺序会在条件判断中出现，因为 flutter_hooks 没有 linter 提示这个错误，这个问题可能会变得很常见。例如下面的代码：

```dart
build() {
  final count = useState(0);

  if (firstRender) {
    useEffect(() {
      count.value = 1;
    }, []);
  }
}
```

上述代码中，`useEffect` 可能不会被执行，就会导致错误的出现。这个问题在 React 中也是存在的，但是 React 有 ESLint 插件可以检测这个问题，而 Flutter 没有，并且 Dart 有可能放大这个问题。例如在 React 中可以写：

```js
function Foo() {
  useState();
  useEffect(() => callback(), []);
  // ...other hooks

  function callback() {
    // do something
  }
}
```

同等代码在 Dart 中会变成：

```dart
build() {
  useState();

  callback() {
    // do something
  }

  useEffect(() {
    callback();
  }, []);
  // ...other hooks
}
```

可以看到，`callback` 在调用前面要被定义，而 JavaScript 没有这个问题，这会导致 Dart 代码里 hooks 无法被归类放到 build 最前面，hooks 和其他函数会被穿插声明，不仅导致代码难以阅读，也会导致 hooks 的顺序错误更加难以被发现。

## 结论

总体上，在 Flutter 中只用函数组件是有些劣势的：

1. 不同于 React，函数组件不是 Flutter Framework 的一等公民
2. 相对于 React，hooks 在 Flutter 中的生态不够完善，可能缺乏一些关键的功能和社区支持。
3. 没有足够的 linter 规则来约束 hooks 的使用。这可能导致代码中 hooks 的使用不规范，增加了维护成本。

在不使用 Riverpod 的情况下，个人倾向于不使用 flutter_hooks，借助 AI 辅助，那些模板代码不至于让开发者感到疲惫。在团队协助中，更多的规范会增加维护成本，在不使用 Riverpod 时，不必要为了简洁而引入 flutter_hooks，即使在使用 Riverpod 的情况下，也要避免 `ConsumerStatefulWidget` 的使用，这表示这在一个组件中混用 Riverpod + hooks + StatefulWidget 三种状态管理。
