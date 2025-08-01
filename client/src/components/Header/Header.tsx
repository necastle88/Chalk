import { SignedIn, UserButton } from "@clerk/clerk-react";

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="header-text-container">
                <h1>Dashboard</h1>
                <p>Your fitness tracking app</p>
            </div>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

export default Header;