# BaLaTeX: LaTeX, for the Information Super Highway

Tired of memorizing the less-than-modern syntax of LaTeX? Can't live without
kerning, Computer Modern Serif and well-justified paragraphs? BaLaTeX is LaTeX
written using XHTML! See Below:

# Getting Started

```html
    <!DOCTYPE html>
    <html>
        <head>
            <title>Your Title</title>
            <script type="text/javascript" src="balatex.js"></script>
        </head>
        <body>
            <article title="Your Interesting Document">
                <header>
                    <p>By: Your Name</p>
                </header>
                <nav title="Table of Contents"></nav>
                <section title="Introduction">
                    <p>
                        Hello World!
                    </p>
                </section>
            </article>
        </body>
    </html>
```

# Using Math

To use math, simply include the following in your <code><head></code>:

```html
<script type="text/x-mathjax-config">
    MathJax.Hub.Config({
        tex2jax: {
            inlineMath: [['$','$'], ['\\(','\\)']]
        }
    });
</script>
<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML&delayStartupUntil=onload">
```

Then, simply place $\LaTeX$-style math statements into your document e.g.
```html
<p>Euler's Identity: 
            $$
                e^{i\pi} + 1 = 0
            $$
</p>
```
