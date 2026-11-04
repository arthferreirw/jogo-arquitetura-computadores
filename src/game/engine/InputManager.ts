/**
 * Input Manager
 * Distinguishes continuous held keys from edge-triggered justPressed events.
 * Manages canvas coordinate conversion, mouse aim, and window blur protection.
 */

export class InputManager {
  private heldKeys: Set<string> = new Set();
  private justPressedKeys: Set<string> = new Set();

  public mouseX: number = 0;
  public mouseY: number = 0;
  public isMouseDown: boolean = false;
  public justClicked: boolean = false;
  public isRightMouseDown: boolean = false;
  public justRightClicked: boolean = false;

  private canvasElement: HTMLCanvasElement | null = null;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('contextmenu', this.handleContextMenu);
  }

  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvasElement = canvas;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    // Prevent default scroll behavior for game keys
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(key)) {
      e.preventDefault();
    }

    if (!this.heldKeys.has(key)) {
      this.justPressedKeys.add(key);
    }
    this.heldKeys.add(key);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    this.heldKeys.delete(key);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.canvasElement) {
      const rect = this.canvasElement.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    } else {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      this.isMouseDown = true;
      this.justClicked = true;
    } else if (e.button === 2) {
      this.isRightMouseDown = true;
      this.justRightClicked = true;
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) {
      this.isMouseDown = false;
    } else if (e.button === 2) {
      this.isRightMouseDown = false;
    }
  }

  private handleContextMenu(e: MouseEvent): void {
    // Prevent context menu to allow RMB dash/action
    e.preventDefault();
  }

  private handleBlur(): void {
    // Clear all held inputs on window blur to avoid stuck movement keys
    this.heldKeys.clear();
    this.justPressedKeys.clear();
    this.isMouseDown = false;
    this.isRightMouseDown = false;
  }

  /**
   * Resets edge-triggered actions at the end of each game tick
   */
  public endFrame(): void {
    this.justPressedKeys.clear();
    this.justClicked = false;
    this.justRightClicked = false;
  }

  public isHeld(key: string): boolean {
    return this.heldKeys.has(key.toLowerCase());
  }

  public wasJustPressed(key: string): boolean {
    return this.justPressedKeys.has(key.toLowerCase());
  }

  public getMovementVector(): { x: number; y: number } {
    let dx = 0;
    let dy = 0;

    if (this.isHeld('w') || this.isHeld('arrowup')) dy -= 1;
    if (this.isHeld('s') || this.isHeld('arrowdown')) dy += 1;
    if (this.isHeld('a') || this.isHeld('arrowleft')) dx -= 1;
    if (this.isHeld('d') || this.isHeld('arrowright')) dx += 1;

    // Normalize diagonal movement vector so diagonal isn't sqrt(2) faster
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    return { x: dx, y: dy };
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('contextmenu', this.handleContextMenu);
  }
}
