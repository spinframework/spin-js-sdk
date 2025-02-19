declare module 'fermyon:spin/variables@2.0.0' {
  /**
   * Get an application variable value for the current component.
   * 
   * The name must match one defined in in the component manifest.
   */
  export function get(name: string): string;
}