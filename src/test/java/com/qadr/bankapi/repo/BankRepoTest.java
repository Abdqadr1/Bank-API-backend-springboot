package com.qadr.bankapi.repo;

import com.qadr.bankapi.AbstractContainerBaseTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.qadr.bankapi.model.Bank;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
class BankRepoTest extends AbstractContainerBaseTest {

    @Autowired
    private BankRepo bankRepo;


    @Test
    void findByType() {
        List<Bank> banks = bankRepo.findByType("microfinance");
        assertThat(banks.size()).isEqualTo(1);
    }

    @Test
    void findByShortName() {
        // given
        String shortName = "KUDA";
        Optional<Bank> bank = bankRepo.findByShortName(shortName);
        assertThat(bank.isPresent()).isTrue();
        assertThat(bank.get().getShortName()).isEqualTo(shortName);
    }

    @Test
    void findBySortCode() {
        // given
        String sortCode = "3752635984";
        Optional<Bank> bank = bankRepo.findBySortCode(sortCode);
        assertThat(bank.isPresent()).isTrue();
        assertThat(bank.get().getSortCode()).isEqualTo(sortCode);
    }
}