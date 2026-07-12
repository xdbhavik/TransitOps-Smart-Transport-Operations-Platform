package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.SequenceCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface SequenceCounterRepository extends JpaRepository<SequenceCounter, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from SequenceCounter s where s.prefix = :prefix")
    Optional<SequenceCounter> findForUpdate(@Param("prefix") String prefix);
}