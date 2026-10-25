<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendOtpNotification extends Notification
{
    use Queueable;

    public string $otp;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $otp)
    {
        $this->otp = $otp;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {   
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Official Verification Code — University of Vanixx Portal')
            ->greeting('Dear Student / Faculty Member,')
            ->line('Thank you for initiating your registration with the University of Vanixx Academic Portal.')
            ->line('To complete your account verification, please enter the following One-Time Password (OTP) in the registration form:')
            ->line('# ' . $this->otp)
            ->line('This security code is strictly valid for **10 minutes**. For your safety and account protection, never disclose or share this code with anyone.')
            ->line('If you did not initiate this registration or did not request an account, please disregard this email or notify IT Academic Services immediately.')
            ->salutation("Sincerely,\nOffice of Academic Affairs & Admissions\nUniversity of Vanixx");
    }
}