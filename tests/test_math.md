![](images/test_img.png)

```python
import this
```

# Inline equations

$\Sigma_{i=0}^\infty \frac{1}{n} = 2$ is a fact. However:

$$\sin x = 12$$

$\exp{2}$

$$\alpha =2$$

$a=b$

You can also have things inline like \alpha or $\alpha$.

This is how it looks like :).

Does it work a bit better like this?
\begin{equation}
a=2
\end{equation}

# Equations blocks

This is an equation:
\begin{equation}
y+2 = 3
\end{equation}

This is a system of equations:
\begin{align*}
x^2+y^2 & = 2 \\
\sin(y) & = 0.2
\end{align*}

$$\sin x = 1$$

This is Euler's formula:
\begin{eqnarray*}
e^{i\pi} + 1 & = & 0.
\end{eqnarray*}

Katex only syntax
$$
\begin{aligned}
x^2+y^2 & = 2 \\
\sin(y) & = 0.5 \\
x &= y
\end{aligned}
$$


\begin{align}
1+2 =3
\end{align}

# [Mermaid](https://mermaid-js.github.io/mermaid/#/README) Graphs

## [Flowchart](https://mermaid-js.github.io/mermaid/#/flowchart)

```mermaid
graph LR
   a --> b & c --> d
```

## [Sequence Diagram](https://mermaid-js.github.io/mermaid/#/sequenceDiagram)

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you!
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly g!
```

# [User Journey Diagram](https://mermaid-js.github.io/mermaid/#/user-journey)

```mermaid
journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me
```
