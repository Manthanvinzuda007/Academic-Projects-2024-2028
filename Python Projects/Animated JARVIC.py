"""
╔══════════════════════════════════════════════════════════╗
║         J.A.E.V.I.S  —  Python / Pygame Edition                    ║
║   Just A Extremely Vivid Intelligence System                       ║
║                                                                    ║
║  Controls:                                                         ║
║    CLICK  centre orb  → cycle status messages                     ║
║    ESC / Q             → quit                                     ║
╚══════════════════════════════════════════════════════════╝
"""

import pygame
import math
import random
import time
import sys

# ─────────────────────────────────────────────
#  INIT
# ─────────────────────────────────────────────
pygame.init()

W, H = 900, 900
screen = pygame.display.set_mode((W, H))
pygame.display.set_caption("J.A.E.V.I.S  —  AI Interface")
clock = pygame.time.Clock()

# ─────────────────────────────────────────────
#  COLOURS
# ─────────────────────────────────────────────
CYAN        = (0, 245, 255)
CYAN_DIM    = (0, 120, 140)
CYAN_FAINT  = (0, 40, 55)
BLUE        = (0, 100, 220)
BLUE_DIM    = (0, 50, 120)
GOLD        = (255, 193, 7)
GOLD_DIM    = (140, 100, 0)
WHITE       = (255, 255, 255)
WHITE_DIM   = (180, 220, 230)
BG          = (2, 13, 26)
BG_MID      = (4, 26, 46)
RED_WARN    = (255, 60, 60)

CX, CY = W // 2, H // 2       # centre of screen

# ─────────────────────────────────────────────
#  FONTS  (fall back gracefully)
# ─────────────────────────────────────────────
def load_font(size, bold=False):
    for name in ("Courier New", "Courier", "monospace", None):
        try:
            return pygame.font.SysFont(name, size, bold=bold)
        except Exception:
            pass
    return pygame.font.Font(None, size)

FONT_TITLE  = load_font(30, bold=True)
FONT_MONO   = load_font(14)
FONT_SMALL  = load_font(11)
FONT_MED    = load_font(17)

# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────
def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def alpha_surface(w, h):
    s = pygame.Surface((w, h), pygame.SRCALPHA)
    s.fill((0, 0, 0, 0))
    return s

def draw_arc_dashed(surf, colour, cx, cy, radius, start_a, end_a,
                    width=1, dash_len=0.08, gap_len=0.05):
    a = start_a
    while a < end_a:
        a2 = min(a + dash_len, end_a)
        pygame.draw.arc(surf, colour,
                        (cx - radius, cy - radius, radius * 2, radius * 2),
                        a, a2, width)
        a += dash_len + gap_len

def glow_circle(surf, colour, cx, cy, r, layers=4, alpha_start=80):
    for i in range(layers, 0, -1):
        s = alpha_surface(r * 2 + 40, r * 2 + 40)
        rr = r + (layers - i) * 5
        a  = alpha_start // layers * i
        pygame.draw.circle(s, (*colour, a), (rr + 20, rr + 20), rr, 2)
        surf.blit(s, (cx - rr - 20, cy - rr - 20))

def text_center(surf, font, txt, cx, cy, colour, alpha=255):
    s = font.render(txt, True, colour)
    if alpha < 255:
        s.set_alpha(alpha)
    surf.blit(s, s.get_rect(center=(cx, cy)))

def radial_point(cx, cy, r, angle_rad):
    return (cx + r * math.cos(angle_rad),
            cy + r * math.sin(angle_rad))

# ─────────────────────────────────────────────
#  STARS
# ─────────────────────────────────────────────
class Star:
    def __init__(self):
        self.reset()
    def reset(self):
        self.x     = random.randint(0, W)
        self.y     = random.randint(0, H)
        self.r     = random.uniform(0.4, 1.4)
        self.phase = random.uniform(0, math.pi * 2)
        self.speed = random.uniform(0.5, 2.0)
    def draw(self, surf, t):
        a = int(80 + 100 * (0.5 + 0.5 * math.sin(t * self.speed + self.phase)))
        s = alpha_surface(6, 6)
        pygame.draw.circle(s, (*CYAN, a), (3, 3), int(self.r))
        surf.blit(s, (self.x - 3, self.y - 3))

STARS = [Star() for _ in range(200)]

# ─────────────────────────────────────────────
#  PARTICLES
# ─────────────────────────────────────────────
class Particle:
    def __init__(self):
        self.respawn()
    def respawn(self):
        angle    = random.uniform(0, math.pi * 2)
        r        = random.uniform(60, 150)
        self.x   = CX + r * math.cos(angle)
        self.y   = CY + r * math.sin(angle)
        self.vx  = random.uniform(-0.4, 0.4)
        self.vy  = random.uniform(-1.2, -0.4)
        self.life = 1.0
        self.decay = random.uniform(0.005, 0.015)
    def update(self):
        self.x   += self.vx
        self.y   += self.vy
        self.life -= self.decay
        if self.life <= 0:
            self.respawn()
    def draw(self, surf):
        a = int(self.life * 200)
        if a < 5:
            return
        s = alpha_surface(8, 8)
        pygame.draw.circle(s, (*CYAN, a), (4, 4), 2)
        surf.blit(s, (int(self.x) - 4, int(self.y) - 4))

PARTICLES = [Particle() for _ in range(80)]

# ─────────────────────────────────────────────
#  DATA BARS
# ─────────────────────────────────────────────
class DataBar:
    def __init__(self, label, delay, speed):
        self.label  = label
        self.delay  = delay
        self.speed  = speed
        self.value  = random.uniform(0.2, 0.9)
        self.target = random.uniform(0.2, 0.95)
    def update(self, t):
        if abs(self.value - self.target) < 0.01:
            self.target = random.uniform(0.15, 0.98)
        self.value += (self.target - self.value) * 0.02 * self.speed
    def draw(self, surf, x, y, w=90, h=5, right=False):
        label_s = FONT_SMALL.render(self.label, True, CYAN_DIM)
        if right:
            surf.blit(label_s, (x - label_s.get_width() - 8, y - 4))
            bx = x - w
        else:
            surf.blit(label_s, (x + w + 8, y - 4))
            bx = x
        # track
        pygame.draw.rect(surf, CYAN_FAINT, (bx, y, w, h), border_radius=2)
        # fill
        fw = int(w * self.value)
        if fw > 2:
            col = lerp_color(BLUE, CYAN, self.value)
            pygame.draw.rect(surf, col, (bx, y, fw, h), border_radius=2)
            # highlight
            s = alpha_surface(fw, h)
            pygame.draw.rect(s, (*WHITE, 60), (0, 0, fw, h // 2), border_radius=2)
            surf.blit(s, (bx, y))

BARS_LEFT  = [
    DataBar("NEURAL", 0.0, 1.0),
    DataBar("POWER ", 0.4, 0.8),
    DataBar("SHIELD", 0.8, 0.6),
    DataBar("SCAN  ", 1.2, 1.2),
    DataBar("COMMS ", 0.2, 0.9),
    DataBar("THRML ", 1.5, 0.7),
]
BARS_RIGHT = [
    DataBar("THRST ", 0.1, 1.1),
    DataBar("CORE  ", 0.6, 0.75),
    DataBar("RADAR ", 1.0, 1.3),
    DataBar("CRYPTO", 1.4, 0.65),
    DataBar("MEMORY", 0.3, 0.85),
    DataBar("SYNC  ", 0.9, 1.05),
]

# ─────────────────────────────────────────────
#  WAVEFORM
# ─────────────────────────────────────────────
WAVE_BARS  = 50
wave_heights = [random.uniform(2, 18) for _ in range(WAVE_BARS)]
wave_targets = [random.uniform(2, 20) for _ in range(WAVE_BARS)]

def update_wave():
    for i in range(WAVE_BARS):
        if abs(wave_heights[i] - wave_targets[i]) < 0.5:
            wave_targets[i] = random.uniform(2, 22)
        wave_heights[i] += (wave_targets[i] - wave_heights[i]) * 0.12

def draw_wave(surf, cx, y, t):
    bar_w = 4
    gap   = 2
    total = WAVE_BARS * (bar_w + gap)
    bx    = cx - total // 2
    for i, h in enumerate(wave_heights):
        col = lerp_color(BLUE, CYAN, h / 22)
        s   = alpha_surface(bar_w, int(h) + 2)
        pygame.draw.rect(s, (*col, 200), (0, 0, bar_w, int(h)), border_radius=2)
        surf.blit(s, (bx + i * (bar_w + gap), y - int(h)))

# ─────────────────────────────────────────────
#  RIPPLE
# ─────────────────────────────────────────────
ripples = []   # list of [radius, alpha]

def spawn_ripple():
    ripples.append([50, 255])

def update_draw_ripples(surf):
    dead = []
    for rpl in ripples:
        rpl[0] += 4
        rpl[1] = max(0, rpl[1] - 8)
        if rpl[1] == 0:
            dead.append(rpl)
            continue
        s = alpha_surface(rpl[0]*2+4, rpl[0]*2+4)
        pygame.draw.circle(s, (*CYAN, rpl[1]), (rpl[0]+2, rpl[0]+2), rpl[0], 2)
        surf.blit(s, (CX - rpl[0] - 2, CY - rpl[0] - 2))
    for d in dead:
        ripples.remove(d)

# ─────────────────────────────────────────────
#  STATUS MESSAGES
# ─────────────────────────────────────────────
MESSAGES = [
    "ALL SYSTEMS NOMINAL",
    "INITIATING SCAN PROTOCOL",
    "ANALYZING THREAT VECTORS",
    "NEURAL NETWORK ENGAGED",
    "POWER SURGE DETECTED",
    "RECALIBRATING SYSTEMS",
    "RUNNING DIAGNOSTICS",
    "TARGET ACQUIRED",
    "ENCRYPTION ACTIVE",
    "UPLINK ESTABLISHED",
    "QUANTUM CORE ONLINE",
    "DEPLOYING COUNTERMEASURES",
]
msg_index  = 0
cur_status = MESSAGES[0]

# ─────────────────────────────────────────────
#  HELPER: DRAW HEX GRID (faint)
# ─────────────────────────────────────────────
def draw_hex_grid(surf, cx, cy, radius, t):
    rows = 10
    col_gap = 28
    row_gap = 24
    s = alpha_surface(radius * 2, radius * 2)
    pulse = 10 + int(5 * math.sin(t * 0.7))
    for row in range(-rows, rows + 1):
        for col in range(-rows, rows + 1):
            hx = cx - radius + (col + 0.5 * (row % 2)) * col_gap
            hy = cy - radius + row * row_gap
            dx, dy = hx - radius, hy - radius
            if dx*dx + dy*dy < (radius - 20)**2:
                pts = []
                for a in range(6):
                    ang = math.radians(a * 60 - 30)
                    pts.append((hx + 12 * math.cos(ang),
                                hy + 12 * math.sin(ang)))
                pygame.draw.polygon(s, (*CYAN, pulse), pts, 1)
    surf.blit(s, (cx - radius, cy - radius))

# ─────────────────────────────────────────────
#  DRAW BRACKET CORNERS
# ─────────────────────────────────────────────
def draw_brackets(surf, x1, y1, x2, y2, size=35):
    col = (*CYAN, 120)
    def corner(ox, oy, dx, dy):
        s = alpha_surface(size + 2, size + 2)
        pygame.draw.line(s, col, (1, 1) if dx > 0 else (size, 1),
                         (size if dx > 0 else 1, 1), 2)
        pygame.draw.line(s, col, (1, 1) if dy > 0 else (1, size),
                         (1, size if dy > 0 else 1), 2)
        surf.blit(s, (ox, oy))
    corner(x1, y1,  1,  1)
    corner(x2 - size, y1, -1,  1)
    corner(x1, y2 - size,  1, -1)
    corner(x2 - size, y2 - size, -1, -1)

# ─────────────────────────────────────────────
#  DRAW TICK MARKS ON RING
# ─────────────────────────────────────────────
def draw_ticks(surf, cx, cy, r, count, inner_r=None, colour=CYAN_DIM, alpha=100):
    if inner_r is None:
        inner_r = r - 12
    s = alpha_surface(W, H)
    for i in range(count):
        ang = math.radians(i * 360 / count)
        x1, y1 = cx + r       * math.cos(ang), cy + r       * math.sin(ang)
        x2, y2 = cx + inner_r * math.cos(ang), cy + inner_r * math.sin(ang)
        pygame.draw.line(s, (*colour, alpha), (int(x1), int(y1)), (int(x2), int(y2)), 1)
    surf.blit(s, (0, 0))

# ─────────────────────────────────────────────
#  DRAW ROTATING TRIANGLE PAIR
# ─────────────────────────────────────────────
def draw_triangle_pair(surf, cx, cy, r, angle):
    s = alpha_surface(W, H)
    for flip in (0, math.pi):
        pts = []
        for i in range(3):
            a = angle + flip + i * (2 * math.pi / 3)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        pygame.draw.polygon(s, (*CYAN, 30), pts, 1)
    surf.blit(s, (0, 0))

# ─────────────────────────────────────────────
#  DRAW CENTRE ORB
# ─────────────────────────────────────────────
ORB_R = 48

def draw_orb(surf, cx, cy, t):
    pulse = 0.5 + 0.5 * math.sin(t * 2)
    # Outer glow
    for layer in range(6, 0, -1):
        r   = ORB_R + layer * 5
        a   = int(15 * layer * pulse)
        gs  = alpha_surface(r * 2 + 4, r * 2 + 4)
        pygame.draw.circle(gs, (*CYAN, a), (r + 2, r + 2), r)
        surf.blit(gs, (cx - r - 2, cy - r - 2))
    # Body
    pygame.draw.circle(surf, BLUE_DIM, (cx, cy), ORB_R)
    pygame.draw.circle(surf, BLUE,     (cx, cy), ORB_R, 2)
    # Inner rings
    for ir in (32, 20, 10):
        pygame.draw.circle(surf, (*CYAN, 60), (cx, cy), ir, 1)
    # Spokes
    for i in range(8):
        a = math.radians(i * 45 + t * 20)
        x1, y1 = cx + 10 * math.cos(a), cy + 10 * math.sin(a)
        x2, y2 = cx + 42 * math.cos(a), cy + 42 * math.sin(a)
        s2 = alpha_surface(W, H)
        pygame.draw.line(s2, (*WHITE, 60), (int(x1), int(y1)), (int(x2), int(y2)), 1)
        surf.blit(s2, (0, 0))
    # Centre dot
    pygame.draw.circle(surf, WHITE, (cx, cy), 7)
    pygame.draw.circle(surf, CYAN,  (cx, cy), 4)

# ─────────────────────────────────────────────
#  SCAN LINE
# ─────────────────────────────────────────────
scan_y   = 0
SCAN_SPD = 2

# ─────────────────────────────────────────────
#  MAIN LOOP
# ─────────────────────────────────────────────
t0   = time.time()
running = True

while running:
    dt = clock.tick(60) / 1000.0
    t  = time.time() - t0

    # ── Events ──────────────────────────────
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key in (pygame.K_ESCAPE, pygame.K_q):
                running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            dist   = math.hypot(mx - CX, my - CY)
            if dist <= ORB_R + 10:
                spawn_ripple()
                msg_index  = (msg_index + 1) % len(MESSAGES)
                cur_status = MESSAGES[msg_index]

    # ── Background ──────────────────────────
    screen.fill(BG)

    # Radial gradient bg
    bg_s = alpha_surface(W, H)
    for r in range(350, 0, -20):
        a = int(8 * (1 - r / 350))
        pygame.draw.circle(bg_s, (*BG_MID, a), (CX, CY), r)
    screen.blit(bg_s, (0, 0))

    # ── Stars ───────────────────────────────
    for star in STARS:
        star.draw(screen, t)

    # ── Hex grid ────────────────────────────
    draw_hex_grid(screen, CX, CY, 200, t)

    # ── RINGS ───────────────────────────────
    # Ring 1 – slowest outer  (340 px radius)
    angle1 = t * 0.4
    glow_circle(screen, CYAN, CX, CY, 340, layers=3, alpha_start=40)
    draw_arc_dashed(screen, (*CYAN, 60),
                    CX - 340, CY - 340, 340,
                    angle1, angle1 + math.pi * 1.6, width=1)
    # dot on ring 1
    dx1, dy1 = radial_point(CX, CY, 340, angle1)
    pygame.draw.circle(screen, CYAN, (int(dx1), int(dy1)), 4)
    glow_s = alpha_surface(20, 20)
    pygame.draw.circle(glow_s, (*CYAN, 120), (10, 10), 8)
    screen.blit(glow_s, (int(dx1) - 10, int(dy1) - 10))

    # Ring 2 – medium (280 px) reverse
    angle2 = -t * 0.7
    draw_ticks(screen, CX, CY, 280, 36, inner_r=270)
    pygame.draw.circle(screen, (*CYAN_DIM, 80), (CX, CY), 280, 1)
    for dot_a in [angle2, angle2 + math.pi]:
        dx2, dy2 = radial_point(CX, CY, 280, dot_a)
        pygame.draw.circle(screen, CYAN, (int(dx2), int(dy2)), 5)

    # Ring 3 – inner dashed (220 px)
    angle3 = t * 1.1
    draw_arc_dashed(screen, (*BLUE, 100),
                    CX - 220, CY - 220, 220,
                    angle3, angle3 + math.pi * 2, width=2,
                    dash_len=0.18, gap_len=0.12)

    # Ring 4 – innermost solid (170 px)
    pygame.draw.circle(screen, (*BLUE_DIM, 60), (CX, CY), 170, 1)

    # ── Triangle spinner ────────────────────
    draw_triangle_pair(screen, CX, CY, 140, t * 0.5)

    # ── Particles ───────────────────────────
    for p in PARTICLES:
        p.update()
        p.draw(screen)

    # ── Centre orb ──────────────────────────
    draw_orb(screen, CX, CY, t)

    # ── Ripples ─────────────────────────────
    update_draw_ripples(screen)

    # ── Data bars LEFT ──────────────────────
    bar_x_l  = CX - 300
    bar_y_l  = CY - 80
    bar_gap  = 26
    for i, bar in enumerate(BARS_LEFT):
        bar.update(t)
        bar.draw(screen, bar_x_l, bar_y_l + i * bar_gap, w=80, right=False)

    # ── Data bars RIGHT ─────────────────────
    bar_x_r = CX + 300
    for i, bar in enumerate(BARS_RIGHT):
        bar.update(t)
        bar.draw(screen, bar_x_r, bar_y_l + i * bar_gap, w=80, right=True)

    # ── Waveform ────────────────────────────
    update_wave()
    draw_wave(screen, CX, CY + 270, t)

    # ── Scan line ───────────────────────────
    scan_y = (scan_y + SCAN_SPD) % H
    scan_s = alpha_surface(W, 3)
    for bx in range(0, W, 4):
        a = int(60 * math.sin(math.pi * bx / W))
        pygame.draw.line(scan_s, (*CYAN, a), (bx, 1), (bx + 2, 1), 2)
    screen.blit(scan_s, (0, scan_y))

    # ── Title ───────────────────────────────
    flicker = 1.0 if (int(t * 10) % 17 not in (0, 1)) else 0.65
    title_s = FONT_TITLE.render("J . A . E . V . I . S", True, CYAN)
    title_s.set_alpha(int(255 * flicker))
    screen.blit(title_s, title_s.get_rect(center=(CX, 38)))

    sub_s = FONT_SMALL.render(
        "JUST A EXTREMELY VIVID INTELLIGENCE SYSTEM", True, CYAN_DIM)
    sub_s.set_alpha(160)
    screen.blit(sub_s, sub_s.get_rect(center=(CX, 64)))

    # ── Status dot + message ────────────────
    dot_a = int(200 * (0.5 + 0.5 * math.sin(t * 4)))
    dot_s = alpha_surface(12, 12)
    pygame.draw.circle(dot_s, (*GOLD, dot_a), (6, 6), 5)
    screen.blit(dot_s, (CX - 160, H - 42))
    text_center(screen, FONT_MED, cur_status, CX + 30, H - 36, GOLD, alpha=200)

    # ── Clock ───────────────────────────────
    time_str = time.strftime("SYS %H:%M:%S  |  UPLINK ACTIVE")
    text_center(screen, FONT_MONO, time_str, CX, H - 64, CYAN_DIM, alpha=160)

    # ── Angle readouts on ring ───────────────
    for deg, label in ((0, "000°"), (90, "090°"), (180, "180°"), (270, "270°")):
        a   = math.radians(deg - 90)
        rx  = CX + 295 * math.cos(a)
        ry  = CY + 295 * math.sin(a)
        rs  = FONT_SMALL.render(label, True, CYAN_DIM)
        rs.set_alpha(120)
        screen.blit(rs, rs.get_rect(center=(int(rx), int(ry))))

    # ── Corner brackets ─────────────────────
    draw_brackets(screen, 10, 10, W - 10, H - 10, size=40)

    # ── Version tag ─────────────────────────
    ver_s = FONT_SMALL.render("v 4.1.7", True, CYAN_DIM)
    ver_s.set_alpha(80)
    screen.blit(ver_s, (W - 60, H - 22))

    # ── Click hint (first 5 s) ───────────────
    if t < 5:
        hint_a = int(200 * min(1, (5 - t)))
        hint_s = FONT_SMALL.render("[ CLICK ORB TO ACTIVATE ]", True, CYAN)
        hint_s.set_alpha(hint_a)
        screen.blit(hint_s, hint_s.get_rect(center=(CX, CY + 80)))

    pygame.display.flip()

pygame.quit()
sys.exit()

