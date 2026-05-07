const fs = require('fs');
let lines = fs.readFileSync('src/pages/LandingPage.css', 'utf8').split('\n');
lines = lines.slice(0, 1427); // Keep up to just before MARKETPLACE CAROUSEL

const newCss = `/* MARKETPLACE CAROUSEL */
.lp-carousel-wrapper {
    width: 100%;
    overflow: visible;
    padding: 20px 0 80px 0;
    margin-top: 40px;
    position: relative;
}

.lp-carousel-track {
    display: flex;
    gap: 40px;
    padding: 20px 5vw;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
}

.lp-carousel-track::-webkit-scrollbar {
    height: 6px;
}

.lp-carousel-track::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
    margin: 0 5vw;
}

.lp-carousel-track::-webkit-scrollbar-thumb {
    background: rgba(172, 248, 0, 0.2);
    border-radius: 10px;
}

.lp-carousel-track::-webkit-scrollbar-thumb:hover {
    background: rgba(172, 248, 0, 0.5);
}

.lp-carousel-card {
    flex: 0 0 380px;
    background: linear-gradient(180deg, rgba(25, 25, 25, 0.8) 0%, rgba(10, 10, 10, 0.95) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 32px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    scroll-snap-align: center;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.lp-carousel-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 100%;
    background: radial-gradient(circle at 50% 0%, rgba(172, 248, 0, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
}

.lp-carousel-card:hover {
    transform: translateY(-10px);
    border-color: rgba(172, 248, 0, 0.3);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(172, 248, 0, 0.1);
}

.lp-carousel-card:hover::before {
    opacity: 1;
}

.lp-card-tier {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 3px;
    color: var(--primary-color);
    background: rgba(172, 248, 0, 0.1);
    padding: 6px 14px;
    border-radius: 100px;
    display: inline-block;
    align-self: flex-start;
    margin-bottom: 24px;
    text-transform: uppercase;
    border: 1px solid rgba(172, 248, 0, 0.2);
}

.lp-card-title {
    font-size: 22px;
    font-weight: 900;
    color: white;
    margin: 0 0 24px 0;
    line-height: 1.2;
}

.lp-card-vol {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 20px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
}

.lp-card-vol::after {
    content: '';
    position: absolute;
    top: -50%; left: -50%; right: -50%; bottom: -50%;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.03), transparent);
    transform: rotate(45deg);
    animation: shine 4s infinite linear;
}

@keyframes shine {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
}

.lp-card-vol-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.lp-card-vol-val {
    font-size: 28px;
    font-weight: 900;
    color: var(--primary-color);
    margin-top: 4px;
    text-shadow: 0 0 20px rgba(172, 248, 0, 0.3);
}

.lp-card-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 24px;
    min-height: 40px;
    font-weight: 500;
}

.lp-card-features {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 40px;
    flex: 1;
}

.lp-card-feature-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
}

.lp-card-footer {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: auto;
}

.lp-card-qty {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 8px 12px;
}

.lp-card-qty button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: 0.2s;
}

.lp-card-qty button:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
}

.lp-card-qty span {
    font-weight: 900;
    font-size: 16px;
    color: white;
}

.lp-card-wa-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 18px;
    border-radius: 20px;
    border: none;
    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
    color: white;
    font-weight: 900;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0 10px 20px rgba(37, 211, 102, 0.2);
}

.lp-card-wa-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 15px 30px rgba(37, 211, 102, 0.4);
}

@media (max-width: 768px) {
    .lp-carousel-card {
        flex: 0 0 320px;
        padding: 30px;
    }
}
`;

fs.writeFileSync('src/pages/LandingPage.css', lines.join('\n') + '\n' + newCss);
