<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeys extends Command
{
    protected $signature = 'vapid:generate';
    protected $description = 'Generate VAPID keys for Web Push notifications';

    public function handle()
    {
        $keys = VAPID::createVapidKeys();
        
        $this->info('=== VAPID Keys ===');
        $this->line('Public Key: ' . $keys['publicKey']);
        $this->line('Private Key: ' . $keys['privateKey']);
        $this->line('');
        $this->info('Add these to your .env file:');
        $this->line('VAPID_PUBLIC_KEY=' . $keys['publicKey']);
        $this->line('VAPID_PRIVATE_KEY=' . $keys['privateKey']);
        $this->line('VAPID_SUBJECT=mailto:tuemail@ejemplo.com');
        
        return 0;
    }
}