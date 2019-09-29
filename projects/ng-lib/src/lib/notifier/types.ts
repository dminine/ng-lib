export abstract class Notifier {
  abstract info(message: string, duration?: number): void;
  abstract success(message: string, duration?: number): void;
  abstract warning(message: string, duration?: number): void;
  abstract error(message: string, duration?: number): void;
}
