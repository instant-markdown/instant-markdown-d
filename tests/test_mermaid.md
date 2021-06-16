<span class="test-case"></span>

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
