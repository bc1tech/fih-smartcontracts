#!/usr/bin/env bash
surya inheritance dist/Contributions.dist.sol | dot -Tpng > analysis/inheritance-tree/Contributions.png
surya inheritance dist/FidelityHouseToken.dist.sol | dot -Tpng > analysis/inheritance-tree/FidelityHouseToken.png
surya inheritance dist/FidelityHousePrivateSale.dist.sol | dot -Tpng > analysis/inheritance-tree/FidelityHousePrivateSale.png
surya inheritance dist/FidelityHousePresale.dist.sol | dot -Tpng > analysis/inheritance-tree/FidelityHousePresale.png
surya inheritance dist/FidelityHouseICO.dist.sol | dot -Tpng > analysis/inheritance-tree/FidelityHouseICO.png
surya inheritance dist/FidelityHouseTimelock.dist.sol | dot -Tpng > analysis/inheritance-tree/FidelityHouseTimelock.png

surya graph dist/Contributions.dist.sol | dot -Tpng > analysis/control-flow/Contributions.png
surya graph dist/FidelityHouseToken.dist.sol | dot -Tpng > analysis/control-flow/FidelityHouseToken.png
surya graph dist/FidelityHousePrivateSale.dist.sol | dot -Tpng > analysis/control-flow/FidelityHousePrivateSale.png
surya graph dist/FidelityHousePresale.dist.sol | dot -Tpng > analysis/control-flow/FidelityHousePresale.png
surya graph dist/FidelityHouseICO.dist.sol | dot -Tpng > analysis/control-flow/FidelityHouseICO.png
surya graph dist/FidelityHouseTimelock.dist.sol | dot -Tpng > analysis/control-flow/FidelityHouseTimelock.png

surya mdreport analysis/description-table/Contributions.md dist/Contributions.dist.sol
surya mdreport analysis/description-table/FidelityHouseToken.md dist/FidelityHouseToken.dist.sol
surya mdreport analysis/description-table/FidelityHousePrivateSale.md dist/FidelityHousePrivateSale.dist.sol
surya mdreport analysis/description-table/FidelityHousePresale.md dist/FidelityHousePresale.dist.sol
surya mdreport analysis/description-table/FidelityHouseICO.md dist/FidelityHouseICO.dist.sol
surya mdreport analysis/description-table/FidelityHouseTimelock.md dist/FidelityHouseTimelock.dist.sol
