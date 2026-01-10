import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Player } from "@/hooks/usePlayers";

interface PlayerComboboxProps {
  players: Player[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  excludeIds?: string[];
}

export function PlayerCombobox({
  players,
  value,
  onValueChange,
  placeholder = "Select player",
  excludeIds = [],
}: PlayerComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const filteredPlayers = players.filter((p) => !excludeIds.includes(p.id));
  const selectedPlayer = players.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedPlayer ? selectedPlayer.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search player..." />
          <CommandList>
            <CommandEmpty>No player found.</CommandEmpty>
            <CommandGroup>
              {filteredPlayers.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.name}
                  onSelect={() => {
                    onValueChange(player.id === value ? "" : player.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === player.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{player.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground truncate">
                    {player.employeeNumber}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
