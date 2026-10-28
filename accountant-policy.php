<?php
declare(strict_types=1);
// Accountant access to legacy read-only files is explicitly narrower than admin access.
function hamun_accountant_file_allowed(string $path): bool {
    if (preg_match('~^assets/(?:AdminApp--kXxpmTx|AccountingPanel-CQf-TkFh|FinancialLedgerPanel-DYq0Kv-Z)\.js$~D',$path)) return true;
    if (preg_match('~^data/private/inventory/(?:bearings|fasteners|machining|packing)\.json$~D',$path)) return true;
    if (in_array($path,['data/acc/core.json','data/acc/treasury.json'],true)) return true;
    return (bool)preg_match('~^data/ledger/(?:meta|(?:accounts|journal|sheet|trial|vouchers)-140[1-5])\.json$~D',$path);
}
function hamun_accountant_core(array $data): array {
    if (!isset($data['acc']) || !is_array($data['acc'])) throw new RuntimeException('Invalid accounting data');
    foreach (['personnel','attendanceLogs','accountantShifts','zarinpal','socialLinks'] as $key) unset($data['acc'][$key]);
    return $data;
}
