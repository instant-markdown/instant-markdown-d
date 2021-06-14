<span class="test-case"></span>

# Math with MathJax

## Inline equations

$\Sigma_{i=0}^\infty \frac{1}{n} = 2$ is a fact. However:

$$\sin x = 12$$

$\exp{2}$

$$\alpha =2$$

$a=b$

You can also have things inline like \alpha or $\alpha$.

## Blocks of equations

This is an equation using `equation` environment:
\begin{equation}
y+2 = 3
\end{equation}

This is a system of equations using `align*` environment:
\begin{align*}
x^2+y^2 & = 2 \\
\sin(y) & = 0.2
\end{align*}

$$\sin x = 1$$

This is Euler's formula using `eqnarray*` environment:
\begin{eqnarray*}
e^{i\pi} + 1 & = & 0.
\end{eqnarray*}

KaTeX only syntax using `aligned` environment:
$$
\begin{aligned}
x^2+y^2 & = 2 \\
\sin(y) & = 0.5 \\
x &= y
\end{aligned}
$$
This uses the `align` environment:

\begin{align}
1+2 =3
\end{align}

