import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export interface FormStyleProps {
  variant?: 'default' | 'inline' | 'floating';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
}

export interface FieldStyleProps {
  error?: boolean;
  touched?: boolean;
  focused?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
}

export interface LabelStyleProps {
  required?: boolean;
  error?: boolean;
  focused?: boolean;
  disabled?: boolean;
  floating?: boolean;
  hasValue?: boolean;
}

const sizeStyles = {
  small: css`
    padding: 8px 12px;
    font-size: 14px;
  `,
  medium: css`
    padding: 12px 16px;
    font-size: 16px;
  `,
  large: css`
    padding: 16px 20px;
    font-size: 18px;
  `
};

const fieldVariants = {
  outlined: css<FieldStyleProps>`
    border: 2px solid ${({ theme, error, focused }) => 
      error ? theme.colors.error : 
      focused ? theme.colors.primary : 
      theme.colors.border};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.background};
    
    &:hover:not(:disabled) {
      border-color: ${({ theme, error }) => 
        error ? theme.colors.error : theme.colors.primary};
    }
  `,
  filled: css<FieldStyleProps>`
    border: none;
    border-bottom: 2px solid ${({ theme, error, focused }) => 
      error ? theme.colors.error : 
      focused ? theme.colors.primary : 
      theme.colors.border};
    background: ${({ theme }) => theme.colors.gray[50]};
    border-radius: 8px 8px 0 0;
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.gray[100]};
    }
  `,
  standard: css<FieldStyleProps>`
    border: none;
    border-bottom: 1px solid ${({ theme, error, focused }) => 
      error ? theme.colors.error : 
      focused ? theme.colors.primary : 
      theme.colors.border};
    background: transparent;
    padding-left: 0;
    padding-right: 0;
  `
};

export const FormContainer = styled.form<FormStyleProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  
  ${({ variant }) => variant === 'inline' && css`
    display: flex;
    gap: 16px;
    align-items: flex-end;
    flex-wrap: wrap;
  `}
  
  ${({ disabled }) => disabled && css`
    opacity: 0.6;
    pointer-events: none;
  `}
`;

export const FormSection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const FieldGroup = styled.div<{ inline?: boolean }>`
  position: relative;
  margin-bottom: 24px;
  
  ${({ inline }) => inline && css`
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 0;
  `}
`;

export const Label = styled.label<LabelStyleProps>`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme, error, disabled }) => 
    disabled ? theme.colors.gray[400] :
    error ? theme.colors.error : 
    theme.colors.text};
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  ${({ required }) => required && css`
    &::after {
      content: ' *';
      color: ${({ theme }) => theme.colors.error};
    }
  `}
  
  ${({ floating, focused, hasValue }) => floating && css`
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    background: ${({ theme }) => theme.colors.background};
    padding: 0 4px;
    pointer-events: none;
    
    ${(focused || hasValue) && css`
      top: 0;
      font-size: 12px;
      color: ${({ theme, error }) => error ? theme.colors.error : theme.colors.primary};
    `}
  `}
`;

export const Input = styled(motion.input)<FieldStyleProps>`
  width: 100%;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  
  ${({ size = 'medium' }) => sizeStyles[size]}
  ${({ variant = 'outlined' }) => fieldVariants[variant]}
  
  &:disabled {
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[500]};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

export const TextArea = styled(motion.textarea)<FieldStyleProps>`
  width: 100%;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  
  ${({ size = 'medium' }) => sizeStyles[size]}
  ${({ variant = 'outlined' }) => fieldVariants[variant]}
  
  &:disabled {
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[500]};
    cursor: not-allowed;
    resize: none;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

export const Select = styled(motion.select)<FieldStyleProps>`
  width: 100%;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  cursor: pointer;
  
  ${({ size = 'medium' }) => sizeStyles[size]}
  ${({ variant = 'outlined' }) => fieldVariants[variant]}
  
  &:disabled {
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[500]};
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled(motion.span)`
  display: block;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: 4px;
  font-weight: 400;
`;

export const HelpText = styled.span`
  display: block;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 4px;
`;

export const FormActions = styled.div<{ align?: 'left' | 'center' | 'right' | 'space-between' }>`
  display: flex;
  gap: 16px;
  margin-top: 32px;
  
  ${({ align = 'right' }) => {
    switch (align) {
      case 'left':
        return css`justify-content: flex-start;`;
      case 'center':
        return css`justify-content: center;`;
      case 'right':
        return css`justify-content: flex-end;`;
      case 'space-between':
        return css`justify-content: space-between;`;
    }}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: ${({ theme }) => theme.colors.primary};
    
    &:disabled {
      cursor: not-allowed;
    }
  
  label {
    margin: 0;
    cursor: pointer;
    user-select: none;
  }
`;

export const RadioWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="radio"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: ${({ theme }) => theme.colors.primary};
    
    &:disabled {
      cursor: not-allowed;
    }
  
  label {
    margin: 0;
    cursor: pointer;
    user-select: none;
  }
`;

export const RadioGroup = styled.div<{ inline?: boolean }>`
  display: flex;
  flex-direction: ${({ inline }) => inline ? 'row' : 'column'};
  gap: ${({ inline }) => inline ? '24px' : '12px'};
`;

export const FileInputWrapper = styled.div`
  position: relative;
  
  input[type="file"] {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    
    &:disabled {
      cursor: not-allowed;
    }
`;

export const FileInputLabel = styled.label<{ isDragging?: boolean; error?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border: 2px dashed ${({ theme, error, isDragging }) => 
    error ? theme.colors.error :
    isDragging ? theme.colors.primary :
    theme.colors.border};
  border-radius: 8px;
  background: ${({ theme, isDragging }) => 
    isDragging ? theme.colors.primary + '10' : theme.colors.gray[50]};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme, error }) => 
      error ? theme.colors.error : theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary + '05'};
  }
`;

export const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
  
  &::after {
    content: '';
    display: block;
    width: ${({ progress }) => progress}%;
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
  }
`;

export const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

export const FormDescription = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 32px;
`;

export const FieldIcon = styled.div<{ position?: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ position = 'left' }) => position === 'left' ? 'left: 16px;' : 'right: 16px;'}
  color: ${({ theme }) => theme.colors.gray[400]};
  pointer-events: none;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const Counter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[500]};
`;

export const ValidationIcon = styled(motion.div)<{ isValid?: boolean }>`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  
  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme, isValid }) => 
      isValid ? theme.colors.success : theme.colors.error};
  }
`;

}
}
}
}
}
