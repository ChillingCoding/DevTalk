<?php
/**
 * TIPO DE TESTE: TESTE UNITÁRIO (BACKEND)
 * Objetivo: Validar a lógica de negócio isolada, como regras de validação e sanitização.
 */

class UserValidationTest {
    //Testa o email
    public static function testEmailValidation() {
        $validEmail = "teste@exemplo.com";
        $invalidEmail = "email-invalido";
        
        $success = filter_var($validEmail, FILTER_VALIDATE_EMAIL) !== false;
        $failure = filter_var($invalidEmail, FILTER_VALIDATE_EMAIL) === false;
        
        if ($success && $failure) {
            echo "[PASS] EmailValidationTest: Lógica de validação de email funciona.\n";
            return true;
        } else {
            echo "[FAIL] EmailValidationTest: Lógica de validação de email falhou.\n";
            return false;
        }
    }
    //Testa se conta os espacos
    public static function testNameTrimming() {
        $name = "  Renato Silva  ";
        $expected = "Renato Silva";
        
        if (trim($name) === $expected) {
            echo "[PASS] NameTrimmingTest: Remoção de espaços funciona.\n";
            return true;
        } else {
            echo "[FAIL] NameTrimmingTest: Remoção de espaços falhou.\n";
            return false;
        }
    }
    //Testa a senha
    public static function testPasswordStrength() {
        $weakPassword = "123";
        $strongPassword = "passwordSegura123";
        
        $weakResult = strlen($weakPassword) >= 6;
        $strongResult = strlen($strongPassword) >= 6;
        
        if (!$weakResult && $strongResult) {
            echo "[PASS] PasswordStrengthTest: Validação de tamanho funciona.\n";
            return true;
        } else {
            echo "[FAIL] PasswordStrengthTest: Validação de tamanho falhou.\n";
            return false;
        }
    }
    //Testa a Injeção de html tags
    public static function testNameSanitization() {
        $dirtyName = "<h1>Renato</h1>";
        $cleanName = strip_tags($dirtyName);
        
        if ($cleanName === "Renato") {
            echo "[PASS] NameSanitizationTest: Limpeza de tags HTML funciona.\n";
            return true;
        } else {
            echo "[FAIL] NameSanitizationTest: Limpeza de tags HTML falhou.\n";
            return false;
        }
    }
}

// Execução simples se corrido diretamente
UserValidationTest::testEmailValidation();
UserValidationTest::testNameTrimming();
UserValidationTest::testPasswordStrength();
UserValidationTest::testNameSanitization();
