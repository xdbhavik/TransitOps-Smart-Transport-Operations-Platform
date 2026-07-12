package com.Transitops.odoo.service.impl;

import com.Transitops.odoo.entity.SequenceCounter;
import com.Transitops.odoo.repository.SequenceCounterRepository;
import com.Transitops.odoo.service.SequenceNumberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SequenceNumberServiceImpl implements SequenceNumberService {

    private final SequenceCounterRepository sequenceCounterRepository;

    @Override
    @Transactional
    public String nextCode(String prefix) {
        SequenceCounter counter = sequenceCounterRepository.findForUpdate(prefix)
                .orElseGet(() -> SequenceCounter.builder()
                        .prefix(prefix)
                        .nextValue(101L)
                        .build());

        long codeValue = counter.getNextValue();
        counter.setNextValue(codeValue + 1);
        sequenceCounterRepository.save(counter);

        return prefix + codeValue;
    }
}