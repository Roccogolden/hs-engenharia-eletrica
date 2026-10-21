"""Gera as imagens do site (WebP em vários tamanhos) a partir do material original do cliente.

Uso (na pasta do projeto):  python publicar/preparar-imagens.py
Saída: site/img/. Rode de novo sempre que trocar uma foto original. Se uma imagem já publicada mudar,
dê um nome novo ao arquivo (as imagens ficam 7 dias em cache no navegador).

Regra da nitidez: largura exibida x densidade da tela <= largura real do arquivo. Por isso nada aqui é ampliado:
cada versão é igual ou menor que o original.
"""
from pathlib import Path

from PIL import Image, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
ORIG = RAIZ / "HS servicos eletricos (@hsservicoseletricos) • Fotos e vídeos do Instagram"
SAIDA = RAIZ / "site" / "img"
SAIDA.mkdir(parents=True, exist_ok=True)

WA = "WhatsApp Image 2026-10-20 at 17.36.{}.jpeg"

# nome final: (arquivo original, recorte (x0, y0, x1, y1) ou None, larguras)
FOTOS = {
    # Topo: forro com dois perfis de LED em "L". Recorte 4:5 tira a cabeça cortada no pé da foto.
    "forro-led": (WA.format("29"), (0, 0, 1200, 1500), [1200, 800, 560]),
    "area-coberta-led": (WA.format("29 (1)"), None, [1200, 900, 600]),
    "quadro-montagem": (WA.format("30 (1)"), None, [1200, 900, 600]),
    "forro-led-andaime": (WA.format("30"), None, [1200, 900, 600]),
    "quadro-disjuntores": (WA.format("31 (1)"), None, [1200, 900, 600]),
    "fachada-led-noite": (WA.format("31 (2)"), None, [720, 480]),
    "quadro-organizado": (WA.format("31 (3)"), None, [1200, 900, 600]),
    "quadro-geral": (WA.format("31 (4)"), None, [1200, 900, 600]),
    "sala-led-pendentes": (WA.format("31 (5)"), None, [1200, 900, 600]),
    "carregador-instalacao": (WA.format("32 (1)"), None, [1200, 900, 600]),
    "carregador-parede": (WA.format("32 (2)"), None, [1200, 900, 600]),
    "cozinha-led": (WA.format("32"), None, [1200, 900, 600]),
    # Stories do Instagram (361 x 640): ficam no tamanho original, sem ampliar.
    "ig-cozinha-apartamento": ("imgi_14_833187318_1380224440859229_1480812586327805568_n.jpg", None, [361]),
    "ig-quadro-celular": ("imgi_15_829687075_965952849231165_2762784365971678552_n.jpg", None, [361]),
    # O lustre (271 px) e o interfone (com figurinha de texto) ficaram de fora: borravam no celular.
    "ig-instalando-led": ("imgi_18_825276457_18114246566132605_2463581796929000338_n.jpg", None, [360]),
}

LOGO = "imgi_21_799622574_1611848170542187_5734182128963473883_n.jpg"


def salvar_webp(img, nome, largura, qualidade=82):
    w, h = img.size
    if largura < w:
        alt = round(h * largura / w)
        img = img.resize((largura, alt), Image.LANCZOS)
        # Reduções grandes perdem um pouco de contorno: nitidez leve e global
        img = img.filter(ImageFilter.UnsharpMask(radius=0.6, percent=40, threshold=2))
    destino = SAIDA / f"{nome}-{img.size[0]}.webp"
    img.save(destino, "WEBP", quality=qualidade, method=6)
    return destino, img.size


def sem_fundo_preto(img):
    """Logo publicado sobre preto: vira PNG/WebP com transparência (alfa = brilho máximo do pixel)."""
    img = img.convert("RGB")
    px = img.load()
    w, h = img.size
    out = Image.new("RGBA", (w, h))
    po = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            a = max(r, g, b)
            if a < 14:  # ruído do JPG no preto
                po[x, y] = (0, 0, 0, 0)
                continue
            po[x, y] = (min(255, r * 255 // a), min(255, g * 255 // a), min(255, b * 255 // a), a)
    return out


def main():
    relatorio = []
    for nome, (arquivo, recorte, larguras) in FOTOS.items():
        img = Image.open(ORIG / arquivo).convert("RGB")
        if recorte:
            img = img.crop(recorte)
        for largura in larguras:
            destino, tam = salvar_webp(img, nome, min(largura, img.size[0]))
            relatorio.append(f"{destino.name:38} {tam[0]}x{tam[1]}  {destino.stat().st_size // 1024} KB")

    logo = Image.open(ORIG / LOGO)
    completo = sem_fundo_preto(logo.crop((10, 200, 358, 436)))  # emblema + "Engenharia e Elétrica" + linha de baixo
    emblema = sem_fundo_preto(logo.crop((20, 200, 358, 360)))  # só o emblema HS
    for img, nome in ((completo, "logo-hs"), (emblema, "logo-hs-emblema")):
        img.save(SAIDA / f"{nome}.webp", "WEBP", quality=90, method=6)
        img.save(SAIDA / f"{nome}.png", optimize=True)
        relatorio.append(f"{nome + '.webp/.png':38} {img.size[0]}x{img.size[1]}")

    # Ícones: as letras HS com o capacete, centradas num quadrado preto (vão para a raiz do site)
    raiz = RAIZ / "site" / "raiz"
    raiz.mkdir(parents=True, exist_ok=True)
    letras = sem_fundo_preto(logo.crop((86, 198, 332, 364)))
    for tam, nome, margem in ((32, "favicon-32.png", 0.02), (192, "favicon-192.png", 0.1), (180, "apple-touch-icon.png", 0.1)):
        fundo = Image.new("RGBA", (tam, tam), (11, 11, 12, 255))
        largura = round(tam * (1 - 2 * margem))
        altura = round(letras.size[1] * largura / letras.size[0])
        icone = letras.resize((largura, altura), Image.LANCZOS)
        fundo.alpha_composite(icone, ((tam - largura) // 2, (tam - altura) // 2))
        fundo.convert("RGB").save(raiz / nome, optimize=True)
        relatorio.append(f"{nome:38} {tam}x{tam}")

    print("\n".join(relatorio))


if __name__ == "__main__":
    main()
