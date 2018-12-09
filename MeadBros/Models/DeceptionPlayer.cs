namespace MeadBros.Models
{
    public enum Direction
    {
        Unknown,
        North,
        East,
        South,
        West
    }

    public class DeceptionPlayer : Player
    {
        public bool IsUndercover { get; set; }
        public Direction Vote { get; set; }

        public DeceptionPlayer() : base() { }

        public DeceptionPlayer(string connectionId) : base(connectionId) {}
    }
}
