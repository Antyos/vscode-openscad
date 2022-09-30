import { /*ValidationAcceptor,*/ ValidationCheck, ValidationRegistry } from 'langium';
import { ScadAstType } from './generated/ast';
import type { ScadServices } from './scad-module';

/**
 * Map AST node types to validation checks.
 */
type ScadChecks = { [type in ScadAstType]?: ValidationCheck | ValidationCheck[] }

/**
 * Registry for validation checks.
 */
export class ScadValidationRegistry extends ValidationRegistry {
    constructor(services: ScadServices) {
        super(services);
        const validator = services.validation.OpenScadValidator;
        const checks: ScadChecks = {
            // Person: validator.checkPersonStartsWithCapital
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class ScadValidator {

    // checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
    //     if (person.name) {
    //         const firstChar = person.name.substring(0, 1);
    //         if (firstChar.toUpperCase() !== firstChar) {
    //             accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
    //         }
    //     }
    // }

}
