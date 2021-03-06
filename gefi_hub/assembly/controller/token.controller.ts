import { Context, logging } from "near-sdk-core";
import { Token } from "../model/token.model";
import { TokenStorage } from "../storage/token.storage";
import { u128, ContractPromise, ContractPromiseBatch } from "near-sdk-core";
import { CrossDeposit, CrossWithdraw } from "../helper/cross.helper";
import { pagination, PaginationResult } from "../helper/pagination.helper";

export function tk_register(name: String, symbol: String, icon: String, ref: String): Token | null {
    const ownerId = Context.sender;
    if (TokenStorage.contain(name)) {
        return TokenStorage.get(name);
    }
    const new_token = new Token(name, symbol, icon, ref);
    new_token.update_rate(1);
    new_token.save();
    return new_token;
}

export function tk_unregister(name: String): Token | null {
    const ownerId = Context.sender;
    return TokenStorage.delete(ownerId, name);
}

export function tk_update(name: String, symbol: String, icon: String, ref: String): bool {
    const ownerId = Context.sender;
    const token = TokenStorage.get(name);
    if (token == null || token.owner !== ownerId) {
        return false;
    }

    token.update_symbol(symbol);
    token.update_icon(icon);
    token.update_ref(ref);
    token.save();

    return true;
}

export function get_rate(ownerId: String, name: String): f64 {
    let token: Token | null;
    if (!TokenStorage.contains(ownerId, name)) {
        return -1;
    }
    token = TokenStorage.get(name);
    // Call something to confirmed user has transfered token
    if (!token) {
        return -1;
    }
    return token.get_rate();
}

// For MVP product only
// export function buy_near(ownerId: String, name: String, amount: u128): ContractPromiseBatch | null {
//     // const ownerId = Context.sender;
//     let token: Token | null;
//     if (!TokenStorage.contains(ownerId, name)) {
//         return null;
//     }
//     token = TokenStorage.get(ownerId, name);
//     // Call something to confirmed user has transfered token
//     if (!token) {
//         return null;
//     }
//     token.buy_near(amount);
//     // TODO: Transfer near to sender
//     return CrossWithdraw(amount);
// }

// export function buy_token(ownerId: String, name: String): ContractPromise | null {
//     let token: Token | null;
//     if (!TokenStorage.contains(ownerId, name)) {
//         return null;
//     }
//     token = TokenStorage.get(ownerId, name);
//     if (!token) {
//         return null;
//     }
//     let amount = Context.attachedDeposit;
//     token.buy_token(amount);
//     // TODO: Cross contract call to add token
//     return CrossDeposit();
// }

export function tk_get(): PaginationResult<Token> {
    const tokens = TokenStorage.gets();
    return pagination(tokens, 0);
}
