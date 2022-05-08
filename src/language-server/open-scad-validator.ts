import { /*ValidationAcceptor,*/ ValidationCheck, ValidationRegistry } from 'langium';
import { OpenScadAstType } from './generated/ast';
import type { OpenScadServices } from './open-scad-module';

/**
 * Map AST node types to validation checks.
 */
type OpenScadChecks = { [type in OpenScadAstType]?: ValidationCheck | ValidationCheck[] }

/**
 * Registry for validation checks.
 */
export class OpenScadValidationRegistry extends ValidationRegistry {
    constructor(services: OpenScadServices) {
        super(services);
        const validator = services.validation.OpenScadValidator;
        const checks: OpenScadChecks = {
            // Person: validator.checkPersonStartsWithCapital
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class OpenScadValidator {

    // checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
    //     if (person.name) {
    //         const firstChar = person.name.substring(0, 1);
    //         if (firstChar.toUpperCase() !== firstChar) {
    //             accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
    //         }
    //     }
    // }

}
