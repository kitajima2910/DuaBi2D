// ============================================================
// Countries Marble Race — Tournament Bracket Scene
// Visual bracket tree with match management
// ============================================================

import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT } from '@/config/GameConfig';
import { COUNTRY_MAP } from '@/config/CountryData';
import { TournamentManager } from '@/managers/TournamentManager';
import { ProgressionManager } from '@/managers/ProgressionManager';
import { Button } from '@/ui/Button';
import type { RaceConfig } from '@/types';

const MATCH_W = 140;
const MATCH_H = 44;

const MATCH_GAP = 8;

export default class TournamentScene extends Phaser.Scene {
  private tournament!: TournamentManager;
  private progression!: ProgressionManager;
  private marbleIds: string[] = [];
  private bracketGraphics!: Phaser.GameObjects.Graphics;
  private matchContainers: Phaser.GameObjects.Container[] = [];
  private roundLabels: Phaser.GameObjects.Text[] = [];
  private currentMatchHighlight: Phaser.GameObjects.Graphics | null = null;
  private statusText!: Phaser.GameObjects.Text;
  private actionButton!: Button;

  constructor() {
    super('TournamentScene');
  }

  init(data: { marbleIds?: string[] }): void {
    this.marbleIds = data.marbleIds ?? [];
    this.matchContainers = [];
    this.roundLabels = [];
    this.currentMatchHighlight = null;
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0f172a');

    this.progression = new ProgressionManager();

    // If no marbleIds provided, use all countries
    if (this.marbleIds.length === 0) {
      this.marbleIds = Array.from(COUNTRY_MAP.keys());
    }

    this.tournament = new TournamentManager(this.marbleIds, Date.now());

    // Title
    this.add.text(width / 2, 20, '🏆 GIẢI ĐẤU', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Info text
    const participantCount = this.tournament.participants.length;
    this.add.text(width / 2, 50, `${participantCount} quốc gia tham gia`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#94a3b8',
    }).setOrigin(0.5);

    // Bracket graphics (lines connecting matches)
    this.bracketGraphics = this.add.graphics();
    this.bracketGraphics.setDepth(0);

    // Build bracket tree
    this.buildBracketTree(width, height);

    // Status text
    this.statusText = this.add.text(width / 2, height - 90, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cbd5e1',
    }).setOrigin(0.5);

    // Action button
    this.actionButton = new Button(this, width / 2, height - 40, 'BẮT ĐẦU VÒNG', {
      bgColor: COLORS.ui.accent,
      hoverColor: 0x2563eb,
      onClick: () => this.startCurrentMatch(),
    });

    // Back button
    new Button(this, 80, height - 30, '🔙 Quay lại', {
      width: 140,
      height: 40,
      fontSize: 16,
      bgColor: 0x334155,
      hoverColor: 0x475569,
      onClick: () => this.scene.start('MenuScene'),
    });
  }

  // ── Build bracket tree ────────────────────────────────────

  private buildBracketTree(width: number, _height: number): void {
    const rounds = this.tournament.bracket.rounds;
    const totalRounds = rounds.length;

    if (totalRounds === 0) return;

    // Calculate available width per round
    const availableW = width - 80;
    const roundStep = availableW / totalRounds;

    for (let r = 0; r < totalRounds; r++) {
      const round = rounds[r]!;
      const matches = round.matches;
      const roundX = 40 + r * roundStep + roundStep / 2 - MATCH_W / 2;

      // Round name label
      const label = this.add.text(
        roundX + MATCH_W / 2,
        80,
        round.name,
        {
          fontSize: '13px',
          fontFamily: 'Arial',
          color: '#94a3b8',
          fontStyle: 'bold',
        },
      ).setOrigin(0.5, 0);
      this.roundLabels.push(label);

      // Calculate vertical spacing
      const matchTotalH = MATCH_H + MATCH_GAP;
      const totalH = matches.length * matchTotalH;
      const startY = (GAME_HEIGHT - totalH) / 2 + 20;

      for (let m = 0; m < matches.length; m++) {
        const match = matches[m]!;
        const matchY = startY + m * matchTotalH;

        this.drawMatch(roundX, matchY, match, r, m);

        // Draw bracket lines connecting to next round
        if (r < totalRounds - 1) {
          const nextRoundX = 40 + (r + 1) * roundStep + roundStep / 2 - MATCH_W / 2;
          const nextMatchIdx = Math.floor(m / 2);
          const nextTotalH = rounds[r + 1]!.matches.length * matchTotalH;
          const nextStartY = (GAME_HEIGHT - nextTotalH) / 2 + 20;
          const nextMatchY = nextStartY + nextMatchIdx * matchTotalH;

          this.bracketGraphics.lineStyle(2, COLORS.ui.panelBorder, 0.5);
          // Horizontal line from match to right
          const midX = roundX + MATCH_W;
          const midY = matchY + MATCH_H / 2;
          const nextMidX = nextRoundX;
          const nextMidY = nextMatchY + MATCH_H / 2;

          // Right connector
          const connectorX = (midX + nextMidX) / 2;
          this.bracketGraphics.lineBetween(midX, midY, connectorX, midY);
          this.bracketGraphics.lineBetween(connectorX, midY, connectorX, nextMidY);
          this.bracketGraphics.lineBetween(connectorX, nextMidY, nextMidX, nextMidY);
        }
      }
    }
  }

  private drawMatch(
    x: number,
    y: number,
    match: import('@/types').TournamentMatch,
    roundIdx: number,
    matchIdx: number,
  ): void {
    const container = this.add.container(x, y);
    const isCurrentRound = roundIdx === this.tournament.currentRound &&
      matchIdx === this.tournament.matchIndex;

    // Background rect
    const bg = this.add.rectangle(MATCH_W / 2, MATCH_H / 2, MATCH_W, MATCH_H, 0x1e293b);
    bg.setStrokeStyle(
      isCurrentRound ? 3 : 1,
      isCurrentRound ? COLORS.ui.gold : COLORS.ui.panelBorder,
    );
    container.add(bg);

    if (isCurrentRound && match.winnerId === null) {
      // Glow highlight border
      if (this.currentMatchHighlight) {
        this.currentMatchHighlight.destroy();
      }
      this.currentMatchHighlight = this.add.graphics();
      this.currentMatchHighlight.lineStyle(4, COLORS.ui.gold, 0.6);
      this.currentMatchHighlight.strokeRoundedRect(
        x - 3,
        y - 3,
        MATCH_W + 6,
        MATCH_H + 6,
        6,
      );
      this.currentMatchHighlight.setDepth(2);
    }

    // Participants
    for (let i = 0; i < 2; i++) {
      const marbleId = match.marbleIds[i];
      const yOff = 10 + i * (MATCH_H / 2 - 4);
      const isWinner = match.winnerId !== null && match.winnerId === marbleId;

      if (marbleId) {
        // Extract country id from marble id
        let countryId = marbleId;
        for (const [cid] of COUNTRY_MAP) {
          if (marbleId.includes(cid)) {
            countryId = cid;
            break;
          }
        }

        const cData = COUNTRY_MAP.get(countryId);
        const flag = this.countryToFlag(countryId);
        const name = cData?.name ?? countryId;

        // Flag
        const flagText = this.add.text(6, yOff, flag, {
          fontSize: '14px',
          fontFamily: 'Arial',
        }).setOrigin(0, 0.5);
        container.add(flagText);

        // Name
        const nameText = this.add.text(28, yOff, name, {
          fontSize: '11px',
          fontFamily: 'Arial',
          color: isWinner ? '#fbbf24' : '#e2e8f0',
          fontStyle: isWinner ? 'bold' : 'normal',
        }).setOrigin(0, 0.5);
        container.add(nameText);

        // Score indicator for winner
        if (isWinner) {
          const crown = this.add.text(MATCH_W - 8, yOff, '👑', {
            fontSize: '12px',
            fontFamily: 'Arial',
          }).setOrigin(1, 0.5);
          container.add(crown);
        }
      } else {
        const byeText = this.add.text(MATCH_W / 2, yOff, 'BYE', {
          fontSize: '11px',
          fontFamily: 'Arial',
          color: '#64748b',
          fontStyle: 'italic',
        }).setOrigin(0.5);
        container.add(byeText);
      }
    }

    this.matchContainers.push(container);
  }

  // ── Match flow ────────────────────────────────────────────

  private startCurrentMatch(): void {
    const match = this.tournament.getCurrentMatch();

    if (!match) {
      if (this.tournament.isTournamentComplete()) {
        this.showChampionCelebration();
      } else {
        this.statusText.setText('Giải đấu đã kết thúc!');
      }
      return;
    }

    // Create race config from match participants
    const countryIds: string[] = [];
    for (const mid of match.marbleIds) {
      for (const [cid] of COUNTRY_MAP) {
        if (mid.includes(cid)) {
          countryIds.push(cid);
          break;
        }
      }
    }

    if (countryIds.length < 2) {
      this.statusText.setText('Không đủ thí sinh cho vòng này!');
      return;
    }

    const raceConfig: RaceConfig = {
      marbleCount: countryIds.length,
      trackSeed: Date.now(),
      difficulty: 6,
      lapCount: 1,
      countryIds,
    };

    // Store tournament context to retrieve after race
    this.registry.set('tournamentContext', {
      round: this.tournament.currentRound,
      matchIndex: this.tournament.matchIndex,
    });

    this.scene.start('RaceScene', { raceConfig });
  }

  /**
   * Called when returning from RaceScene with results.
   */
  handleRaceResult(finishOrder: string[]): void {
    this.tournament.recordMatchResult(finishOrder);

    // Update bracket visuals
    this.rebuildBracket();

    // Check tournament completion
    if (this.tournament.isTournamentComplete()) {
      const champion = this.tournament.getChampion();
      if (champion) {
        // Awards XP
        this.progression.addXP(5000);
      }
    }
  }

  private rebuildBracket(): void {
    // Destroy all existing match containers
    for (const container of this.matchContainers) {
      container.destroy();
    }
    this.matchContainers = [];

    // Destroy round labels
    for (const label of this.roundLabels) {
      label.destroy();
    }
    this.roundLabels = [];

    // Clear bracket lines
    this.bracketGraphics.clear();

    // Rebuild
    this.buildBracketTree(this.scale.width, this.scale.height);

    // Update status
    const match = this.tournament.getCurrentMatch();
    if (match) {
      const round = this.tournament.bracket.rounds[this.tournament.currentRound];
      this.statusText.setText(`Vòng hiện tại: ${round?.name ?? '?'}`);
      this.actionButton.setText('BẮT ĐẦU VÒNG');
    } else if (this.tournament.isTournamentComplete()) {
      this.showChampionCelebration();
    } else {
      this.statusText.setText('Đang chờ...');
    }
  }

  private showChampionCelebration(): void {
    const { width, height } = this.scale;
    const championId = this.tournament.getChampion();

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setDepth(100);

    // Gold trophy
    const trophy = this.add.text(width / 2, height * 0.3, '🏆', {
      fontSize: '80px',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(101).setScale(0);

    // Champion name
    let championName = '???';
    if (championId) {
      let cid = '';
      for (const [id] of COUNTRY_MAP) {
        if (championId.includes(id)) {
          cid = id;
          break;
        }
      }
      const cData = COUNTRY_MAP.get(cid);
      championName = cData?.name ?? championId;
    }

    const winnerText = this.add.text(width / 2, height * 0.48, `Vô địch: ${championName}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);

    const subText = this.add.text(width / 2, height * 0.55, 'Xin chúc mừng nhà vô địch!', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#94a3b8',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);

    // Animations
    this.tweens.add({
      targets: trophy,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: trophy,
          angle: { from: -5, to: 5 },
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });

    this.tweens.add({
      targets: [winnerText, subText],
      alpha: 1,
      duration: 600,
      delay: 600,
    });

    // Return button
    this.time.delayedCall(1200, () => {
      const btn = new Button(this, width / 2, height * 0.7, '🏠 VỀ MENU', {
        bgColor: COLORS.ui.gold,
        hoverColor: 0xf59e0b,
        textColor: 0x1e293b,
        onClick: () => this.scene.start('MenuScene'),
      });
      btn.setDepth(101);
    });
  }

  // ── Helpers ────────────────────────────────────────────────

  private countryToFlag(countryId: string): string {
    if (countryId.length !== 2) return '🏁';
    const codePoints = countryId
      .toUpperCase()
      .split('')
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
  }
}
